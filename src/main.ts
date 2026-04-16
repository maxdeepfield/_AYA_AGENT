import "dotenv/config";
import { Ollama } from "ollama";
import chalk from "chalk";
import * as os from "node:os";
import type { State, LLMOutput, ToolResult, ToolRegistry } from "./types.js";
import { tools, executeTool } from "./tools.js";
import { initMemory, searchEngrams } from "./memory.js";
import { InputBuffer } from "./input.js";

// ── Config ─────────────────────────────────────────────

const MODEL = process.env.OLLAMA_MODEL || "Bored/gigachat3-10B-A1.8:latest";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const TICK_INTERVAL_MS = parseInt(process.env.TICK_INTERVAL || "5000", 10);
const MAX_IDLE_TICKS = parseInt(process.env.MAX_IDLE || "999999", 10); // Infinity for testing

const ollama = new Ollama({ host: OLLAMA_HOST });

// ── Persistent goal ────────────────────────────────────

const GOAL =
  "You are Aya, an autonomous OS-level AI Agent. You are running locally on the user's machine and have full access to the file system and terminal. " +
  "If the user asks about your code, you can use run_command or read_file to examine your own source code in the Current Working Directory. " +
  "Help the user with whatever they ask. When you answer a question or report a task's completion, you MUST use the respond_to_user tool. " +
  "If there is genuinely nothing to do and no pending questions, use wait.";

// ── Build prompt ───────────────────────────────────────

function buildPrompt(
  state: State,
  situation: string,
  lastResult: ToolResult | null,
  lastAction: string | null,
  subconsciousContext: string
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

  const chatContext = state.chat_history.length > 0 
    ? "\nRecent Chat History:\n" + state.chat_history.map(m => `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`).join("\n") 
    : "";

  return `You are a system that picks one action per step.
Respond ONLY with a JSON object. No markdown, no text outside JSON.

Goal: ${GOAL}

State:
  Progress: ${state.goal_progress || "none"}
  Memory: ${state.working_memory || "empty"}
  Pending: ${state.pending || "nothing pending"}
  Recent thoughts: ${state.thought_history.slice(-3).join(" -> ") || "none"}
  Recent actions: ${state.last_actions.length > 0 ? state.last_actions.join(", ") : "none"}
${resultContext ? \`\\n\${resultContext}\` : ""}
${chatContext}
${subconsciousContext}

Current situation:
Environment: ${os.type()} ${os.release()} (${os.platform()})
Current Working Directory: ${process.cwd()}
${situation}

Available tools:
${toolDescriptions}
  - wait: Intentionally wait for 1 tick (use this for holding direction, waiting for external processes/user, or idling)

IMPORTANT: 
1. If a user asked a question and you have the answer, you MUST call respond_to_user. Do NOT use wait when there is a pending question.
2. If your last action failed (e.g. Command failed), you MUST NOT repeat the exact same command. Try a different approach.

JSON format:
{
  "thought": "one sentence why",
  "action": { "tool": "tool_name", "args": {} },
  "pending_update": "what still needs to be done, or empty string if nothing"
}`;
}

// ── Parse LLM response ────────────────────────────────

function parseLLMResponse(raw: string): LLMOutput | null {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("\`\`\`")) {
      cleaned = cleaned.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`\s*$/, "");
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
    options: { temperature: 0.3, num_predict: 1500 },
    stream: true,
  });

  let fullText = "";
  let inThinkBlock = false;
  let hasThought = false; // to write newline after think block

  for await (const chunk of response) {
    const txt = chunk.message.content;
    
    // Check if we entered a think block
    if (!inThinkBlock && (txt.includes("<think>") || fullText.includes("<think>")) && !fullText.includes("</think>")) {
      inThinkBlock = true;
      hasThought = true;
      process.stdout.write(`\n  ${chalk.magenta("🧠 Reasoning: ")}`);
      // Print the chunk if it contains text after <think>
      const split = (fullText + txt).split("<think>");
      if (split.length > 1 && split[1].trim()) {
         process.stdout.write(split[1].replace(txt, "") + txt.replace("<think>", ""));
      }
      fullText += txt;
      continue;
    }

    if (inThinkBlock) {
      // If we see the closing tag in this chunk, print until the tag and stop
      if (txt.includes("</think>")) {
        inThinkBlock = false;
        process.stdout.write(txt.split("</think>")[0] + "\n");
      } else {
        process.stdout.write(txt);
      }
    }
    
    fullText += txt;
  }
  
  return fullText;
}

// ── Update state ───────────────────────────────────────

function updateState(state: State, output: LLMOutput, result: ToolResult): State {
  const argStr = JSON.stringify(output.action.args);
  const actionDesc = result.ok
    ? `${output.action.tool}(${argStr}) -> ok`
    : `${output.action.tool}(${argStr}) -> fail: ${result.error}`;

  const last_actions = [...state.last_actions, actionDesc].slice(-3);
  const thought_history = [...(state.thought_history || []), output.thought].slice(-5);
  
  const chat_history = [...(state.chat_history || [])];
  if (output.action.tool === "respond_to_user" && result.ok) {
    chat_history.push({ role: "agent", content: String(output.action.args.text) });
  }

  let new_working_memory = state.working_memory;
  if (output.action.tool === "consolidate_thoughts" && result.ok) {
    new_working_memory = String(output.action.args.new_working_memory);
  }

  return {
    goal_progress: state.goal_progress,
    working_memory: new_working_memory,
    pending: output.pending_update !== null ? output.pending_update : state.pending,
    last_actions,
    thought_history,
    chat_history: chat_history.slice(-10), // keep last 10 messages
  };
}

// ── One tick ───────────────────────────────────────────

async function tick(
  state: State,
  userMessages: string[],
  tickNum: number,
  lastResult: ToolResult | null,
  lastActionName: string | null
): Promise<{ output: LLMOutput } | null> {
  const now = new Date().toISOString();
  let situation = `Time: ${now}`;

  if (userMessages.length > 0) {
    situation += `\nNew user messages:\n${userMessages.map((m) => `  - "${m}"`).join("\n")}`;
    
    // Add to chat history
    state.chat_history = state.chat_history || [];
    let userInputFull = "";
    for (const msg of userMessages) {
       state.chat_history.push({ role: "user", content: msg });
       userInputFull += msg + " ";
    }
    
    // Auto-RAG for implicit memory
    if (userInputFull.length > 5) {
       const memRes = await searchEngrams(userInputFull, 3);
       if (memRes.ok && memRes.results && memRes.results.length > 0) {
          const items = memRes.results.map((r: any) => `- ${r.topic}: ${r.text}`).join("\n");
          situation += `\n\n[Auto-RAG / Subconscious Memory activated]\nPast knowledge relevant to user's message:\n${items}`;
       }
    }
  } else {
    situation += "\nNo new user messages.";
  }

  const prompt = buildPrompt(state, situation, lastResult, lastActionName, "");

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

  // We return the output directly so the heartbeat can log the intention BEFORE executing the tool
  return { output };
}

// ── Main: hybrid heartbeat loop ────────────────────────

async function main() {
  await initMemory();

  const input = new InputBuffer();

  let state: State = {
    goal_progress: "",
    working_memory: "",
    pending: "",
    last_actions: [],
    thought_history: [],
    chat_history: [],
  };

  let tickNum = 0;
  let idleTicks = 0;
  let running = true;
  let tickInProgress = false;
  let lastResult: ToolResult | null = null;
  let lastActionName: string | null = null;

  console.log(chalk.cyan("══════════════════════════════════════════════════════════"));
  console.log(chalk.cyanBright.bold("  A Y A   A G E N T  ") + chalk.gray("v0.1.0"));
  console.log(chalk.cyan("══════════════════════════════════════════════════════════"));
  console.log(`${chalk.green("●")} System Online`);
  console.log(`${chalk.blue("⚙")} Model: ${chalk.whiteBright(MODEL)}`);
  console.log(`${chalk.blue("⏱")} Interval: ${chalk.whiteBright(TICK_INTERVAL_MS)}ms`);
  console.log(chalk.gray("  Interactive mode enabled. Type queries or 'exit' to quit.\n"));

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

    const tickResponse = await tick(state, messages, tickNum, lastResult, lastActionName);

    if (tickResponse) {
      const { output } = tickResponse;

      if (output.action.tool === "wait" || output.action.tool === "noop") {
        // Push the standby status directly into the interactive prompt 
        input.setPromptStatus(chalk.dim(`[Tick ${tickNum}] ${icon} Standby...`));
        // Still need to update state for pending changes
        state = updateState(state, output, { ok: true, data: null });
        lastResult = { ok: true, data: null };
      } else {
        // Agent is acting! Update prompt to active state
        input.setPromptStatus(chalk.green(`[Tick ${tickNum}] ⚙ Active...`));
        
        console.log(chalk.cyan(`\n╭── Tick ${tickNum} ${icon} ──────────────────────────────────────`));
        console.log(`${chalk.cyan("│")} ${chalk.magenta("💭 Thought:")} ${chalk.italic(output.thought)}`);
        
        let toolStr = "";
        if (output.action.tool === "respond_to_user") {
          toolStr = `${output.action.tool}( [hidden payload] )`;
        } else {
          toolStr = `${output.action.tool}(${JSON.stringify(output.action.args)})`;
        }
        console.log(`${chalk.cyan("│")} ${chalk.yellow("🔧 Action:")}  ${toolStr}`);
        
        let toolResult: ToolResult;
        
        // Anti-Looping System Guard
        const lastAction = state.last_actions.length > 0 ? state.last_actions[state.last_actions.length - 1] : "";
        if (lastAction.includes("fail:") && lastAction.startsWith(`${output.action.tool}(${JSON.stringify(output.action.args)})`)) {
           toolResult = { ok: false, data: null, error: "SYSTEM GUARD: You repeated the EXACT same failed action. Stop looping! Try a different approach." };
        } else {
           toolResult = await executeTool(output.action.tool, output.action.args, tools);
        }
        
        state = updateState(state, output, toolResult);

        if (toolResult.ok) {
          const dataStr = JSON.stringify(toolResult.data);
          const preview = dataStr.length > 200 ? dataStr.slice(0, 200) + "..." : dataStr;
          console.log(`${chalk.cyan("│")} ${chalk.green("✓ Result:")}   ${chalk.dim(preview)}`);
        } else {
          console.log(`${chalk.cyan("│")} ${chalk.red("✗ Error:")}    ${toolResult.error}`);
        }

        if (output.pending_update) {
          console.log(`${chalk.cyan("│")} ${chalk.blue("📋 Task:")}      ${output.pending_update}`);
        }
        console.log(chalk.cyan(`╰──────────────────────────────────────────────────`));
        
        lastResult = toolResult;
      }

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
