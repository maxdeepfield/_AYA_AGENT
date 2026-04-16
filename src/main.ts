import { Ollama } from "ollama";
import type { State, LLMOutput, ToolResult, ToolRegistry } from "./types.js";
import { tools, executeTool } from "./tools.js";
import { InputBuffer } from "./input.js";

// ── Config ─────────────────────────────────────────────

const MODEL = process.env.OLLAMA_MODEL || "qwen3.5:4b-q4_K_M";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const TICK_INTERVAL_MS = parseInt(process.env.TICK_INTERVAL || "5000", 10);
const MAX_IDLE_TICKS = parseInt(process.env.MAX_IDLE || "999999", 10); // Infinity for testing

const ollama = new Ollama({ host: OLLAMA_HOST });

// ── Persistent goal ────────────────────────────────────

const GOAL =
  "You are a persistent assistant. Help the user with whatever they ask. " +
  "When the user asks something, you MUST eventually respond to them using respond_to_user. " +
  "Reading a file is not a response — you must ALSO call respond_to_user with the answer. " +
  "If there is truly nothing to do and no pending questions, use noop.";

// ── Build prompt ───────────────────────────────────────

function buildPrompt(
  state: State,
  situation: string,
  lastResult: ToolResult | null,
  lastAction: string | null
): string {
  const toolDescriptions = Object.entries(tools)
    .map(([name, def]) => `  - ${name}: ${def.description}`)
    .join("\n");

  // Build last result context
  let resultContext = "";
  if (lastResult && lastAction) {
    if (lastAction === "noop") {
      resultContext = "Last action: noop (did nothing)";
    } else {
      const resultStr = JSON.stringify(lastResult.data);
      // Truncate very large results
      const truncated = resultStr.length > 800 ? resultStr.slice(0, 800) + "..." : resultStr;
      resultContext = `Last action: ${lastAction}\nResult: ${truncated}`;
    }
  }

  return `You are a system that picks one action per step.
Respond ONLY with a JSON object. No markdown, no text outside JSON.

Goal: ${GOAL}

State:
  Progress: ${state.goal_progress || "none"}
  Memory: ${state.working_memory || "empty"}
  Pending: ${state.pending || "nothing pending"}
  Recent actions: ${state.last_actions.length > 0 ? state.last_actions.join(", ") : "none"}
${resultContext ? `\n${resultContext}` : ""}

Current situation:
${situation}

Available tools:
${toolDescriptions}
  - noop: Do nothing (ONLY when there is genuinely nothing to do)

IMPORTANT: If a user asked a question and you have the answer, you MUST call respond_to_user. Do NOT noop when there is a pending question.

JSON format:
{
  "thought": "one sentence why",
  "action": { "tool": "tool_name", "args": {} },
  "memory_update": "key facts to remember",
  "pending_update": "what still needs to be done, or empty string if nothing"
}`;
}

// ── Parse LLM response ────────────────────────────────

function parseLLMResponse(raw: string): LLMOutput | null {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    }
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.action || typeof parsed.action.tool !== "string") return null;

    return {
      thought: parsed.thought || "",
      action: {
        tool: parsed.action.tool,
        args: parsed.action.args || {},
      },
      memory_update: parsed.memory_update || "",
      pending_update: parsed.pending_update ?? null,
    };
  } catch {
    return null;
  }
}

// ── Call LLM ───────────────────────────────────────────

async function callLLM(prompt: string): Promise<string> {
  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    options: { temperature: 0.3, num_predict: 500 },
  });
  return response.message.content;
}

// ── Update state ───────────────────────────────────────

function updateState(state: State, output: LLMOutput, result: ToolResult): State {
  const actionDesc = result.ok
    ? `${output.action.tool}(ok)`
    : `${output.action.tool}(fail: ${result.error})`;

  const last_actions = [...state.last_actions, actionDesc].slice(-3);

  return {
    goal_progress: output.memory_update || state.goal_progress,
    working_memory: output.memory_update || state.working_memory,
    pending: output.pending_update !== null ? output.pending_update : state.pending,
    last_actions,
  };
}

// ── One tick ───────────────────────────────────────────

async function tick(
  state: State,
  userMessages: string[],
  tickNum: number,
  lastResult: ToolResult | null,
  lastActionName: string | null
): Promise<{ state: State; result: ToolResult; output: LLMOutput } | null> {
  const now = new Date().toISOString();
  let situation = `Time: ${now}`;

  if (userMessages.length > 0) {
    situation += `\nNew user messages:\n${userMessages.map((m) => `  - "${m}"`).join("\n")}`;
  } else {
    situation += "\nNo new user messages.";
  }

  const prompt = buildPrompt(state, situation, lastResult, lastActionName);

  let output: LLMOutput | null = null;
  let retries = 0;

  while (!output && retries < 3) {
    if (retries > 0) console.log(`  ⟳ Retry ${retries}...`);
    const raw = await callLLM(prompt);
    output = parseLLMResponse(raw);
    if (!output) {
      console.log(`  ⚠ Invalid JSON. Raw: ${raw.slice(0, 150)}`);
      retries++;
    }
  }

  if (!output) {
    console.log(`  ✖ Failed to parse LLM response.`);
    return null;
  }

  const result = await executeTool(output.action.tool, output.action.args, tools);
  const newState = updateState(state, output, result);

  return { state: newState, result, output };
}

// ── Main: hybrid heartbeat loop ────────────────────────

async function main() {
  const input = new InputBuffer();

  let state: State = {
    goal_progress: "",
    working_memory: "",
    pending: "",
    last_actions: [],
  };

  let tickNum = 0;
  let idleTicks = 0;
  let running = true;
  let tickInProgress = false;
  let lastResult: ToolResult | null = null;
  let lastActionName: string | null = null;

  console.log("═══════════════════════════════════════");
  console.log("  AYA Agent — Hybrid Interactive Mode");
  console.log(`  Model: ${MODEL}`);
  console.log(`  Tick interval: ${TICK_INTERVAL_MS}ms`);
  console.log(`  Type messages anytime. Type 'exit' to quit.`);
  console.log("═══════════════════════════════════════\n");

  input.on("input", (msg: string) => {
    console.log(`  📩 Buffered: "${msg}"`);
  });

  input.on("close", () => {
    running = false;
  });

  async function heartbeat() {
    if (!running || tickInProgress) return;
    tickInProgress = true;

    tickNum++;
    const messages = input.drain();
    const hasInput = messages.length > 0;
    const hasPending = !!(state.pending && state.pending.length > 0);

    // Check for exit
    if (messages.some((m) => m.toLowerCase() === "exit" || m.toLowerCase() === "quit")) {
      console.log("\n👋 Goodbye.\n");
      running = false;
      input.close();
      clearInterval(timer);
      tickInProgress = false;
      return;
    }

    // Skip tick if truly idle: no input, no pending work, and idle too long
    if (!hasInput && !hasPending) {
      idleTicks++;
      if (idleTicks > MAX_IDLE_TICKS) {
        tickInProgress = false;
        return;
      }
    } else {
      idleTicks = 0;
    }

    // ── Run tick
    const icon = hasInput ? "💬" : hasPending ? "⚙️" : "⏳";

    const result = await tick(state, messages, tickNum, lastResult, lastActionName);

    if (result) {
      const { output, result: toolResult } = result;

      if (output.action.tool === "noop") {
        // Compact logging for noop - overwrites the same line
        process.stdout.write(`\r  [Tick ${tickNum}] ${icon} noop...               `);
      } else {
        // Clear the compact line first
        process.stdout.write("\r" + " ".repeat(40) + "\r");
        console.log(`── Tick ${tickNum} ${icon} ──────────────────────────`);
        console.log(`  💭 ${output.thought}`);
        console.log(`  🔧 ${output.action.tool}(${JSON.stringify(output.action.args)})`);
        
        if (toolResult.ok) {
          const dataStr = JSON.stringify(toolResult.data);
          console.log(`  ✓ ${dataStr.length > 200 ? dataStr.slice(0, 200) + "..." : dataStr}`);
        } else {
          console.log(`  ✗ ${toolResult.error}`);
        }

        if (output.pending_update) {
          console.log(`  📋 Pending: ${output.pending_update}`);
        }
        console.log(""); // Empty line for spacing
      }

      state = result.state;
      lastResult = toolResult;
      lastActionName = output.action.tool;
    }

    tickInProgress = false;
  }

  const timer = setInterval(heartbeat, TICK_INTERVAL_MS);
  await heartbeat();
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
