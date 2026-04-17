import "dotenv/config";
import chalk from "chalk";
import * as os from "node:os";
import { Ollama } from "ollama";
import { InputBuffer } from "./input.js";
import { initMemory, searchEngrams, writeEngram, loadState, upsertState } from "./memory.js";
import { executeTool, tools } from "./tools.js";
import { DEFAULT_DIRECTIVES, DEFAULT_MISSION, SYSTEM_PROMPT_TEMPLATE } from "./prompts.js";
import type { LLMOutput, State, ToolResult } from "./types.js";

const MODEL = process.env.OLLAMA_MODEL || "Bored/gigachat3-10B-A1.8:latest";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const TICK_INTERVAL_MS = Number.parseInt(process.env.TICK_INTERVAL || "5000", 10);
const MAX_IDLE_TICKS = Number.parseInt(process.env.MAX_IDLE || "999999", 10);
const DIRECTIVES = process.env.DIRECTIVES || DEFAULT_DIRECTIVES;
const MISSION = process.env.MISSION || DEFAULT_MISSION;

const ollama = new Ollama({ host: OLLAMA_HOST });

function buildPrompt(
  state: State,
  situation: string,
  lastResult: ToolResult | null,
  lastAction: string | null
): string {
  const toolDescriptions = Object.entries(tools)
    .map(([name, def]) => `  - ${name}: ${def.description}`)
    .join("\n");

  const resultText =
    lastResult && lastAction
      ? lastAction === "noop"
        ? "\nLast action: noop (did nothing)"
        : `\nLast action: ${lastAction}\nResult: ${String(JSON.stringify(lastResult.data) ?? lastResult.data).slice(0, 800)}`
      : "";

  const chatText = state.chat_history.length
    ? `\nRecent Chat History:\n${state.chat_history
        .map((message) => `${message.role === "user" ? "User" : "You"}: ${message.content}`)
        .join("\n")}`
    : "";

  return SYSTEM_PROMPT_TEMPLATE
    .replace("{DIRECTIVES}", DIRECTIVES)
    .replace("{mission_progress}", state.mission_progress || "none")
    .replace("{working_memory}", state.working_memory || "empty")
    .replace("{pending}", state.pending || "nothing pending")
    .replace("{recent_thoughts}", state.thought_history.slice(-3).join(" -> ") || "none")
    .replace("{recent_actions}", state.last_actions.length ? state.last_actions.join(", ") : "none")
    .replace("{result_text}", resultText)
    .replace("{chat_text}", chatText)
    .replace("{os_info}", `${os.type()} ${os.release()} (${os.platform()})`)
    .replace("{cwd}", process.cwd())
    .replace("{situation}", situation)
    .replace("{tool_descriptions}", toolDescriptions);
}

function parseLLMResponse(raw: string): LLMOutput | null {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    }

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (typeof parsed?.action?.tool !== "string") return null;

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

async function callLLM(prompt: string): Promise<string> {
  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    options: { temperature: 0.3, num_predict: 1500 },
    stream: true,
  });

  let fullText = "";
  let inThinkBlock = false;

  for await (const chunk of response) {
    const text = chunk.message.content;
    const combined = fullText + text;

    if (!inThinkBlock && combined.includes("<think>") && !combined.includes("</think>")) {
      inThinkBlock = true;
      process.stdout.write(`\n  ${chalk.magenta("🧠 Reasoning: ")}`);
      const visible = combined.split("<think>")[1] || "";
      if (visible.trim()) {
        process.stdout.write(visible.slice(0, Math.max(0, visible.length - text.length)) + text.replace("<think>", ""));
      }
      fullText += text;
      continue;
    }

    if (inThinkBlock) {
      if (text.includes("</think>")) {
        inThinkBlock = false;
        process.stdout.write(text.split("</think>")[0] + "\n");
      } else {
        process.stdout.write(text);
      }
    }

    fullText += text;
  }

  return fullText;
}

function updateState(state: State, output: LLMOutput, result: ToolResult): State {
  const actionText = `${output.action.tool}(${JSON.stringify(output.action.args)}) -> ${
    result.ok ? "ok" : `fail: ${result.error}`
  }`;

  return {
    ...state,
    working_memory:
      output.action.tool === "consolidate_thoughts" && result.ok
        ? String(output.action.args.new_working_memory)
        : state.working_memory,
    pending:
      output.action.tool === "respond_to_user" && result.ok && !output.pending_update
        ? "" // Task complete after response
        : output.pending_update ?? state.pending,
    last_actions: [...state.last_actions, actionText].slice(-3),
    thought_history: [...state.thought_history, output.thought].slice(-5),
    chat_history:
      output.action.tool === "respond_to_user" && result.ok
        ? [...state.chat_history, { role: "agent", content: String(output.action.args.text) }].slice(-10)
        : state.chat_history.slice(-10),
  };
}

async function autoStoreMemory(state: State, userMsg: string, agentMsg: string) {
  if (userMsg.length < 10 && agentMsg.length < 10) return;
  
  const text = `User: ${userMsg}\nAya: ${agentMsg}`;
  const topic = "Recent Conversation";
  
  console.log(chalk.gray("  🧠 Archiving memory to subconscious..."));
  const result = await writeEngram(topic, text);
  if (!result.ok) {
    console.error(chalk.red(`  ❌ Failed to archive memory: ${result.error}`));
  }
}

async function tick(
  state: State,
  userMessages: string[],
  lastResult: ToolResult | null,
  lastActionName: string | null
): Promise<LLMOutput | null> {
  let situation = `Time: ${new Date().toISOString()}`;

  if (userMessages.length) {
    situation += `\nNew user messages:\n${userMessages.map((message) => `  - "${message}"`).join("\n")}`;
    state.chat_history.push(...userMessages.map((content) => ({ role: "user", content })));

    const combinedInput = userMessages.join(" ");
    if (combinedInput.length > 5) {
      const memoryResult = await searchEngrams(combinedInput, 3);
      if (memoryResult.ok && memoryResult.results?.length) {
        const items = memoryResult.results.map((result: any) => `- ${result.topic}: ${result.text}`).join("\n");
        situation += `\n\n[Auto-RAG / Subconscious Memory activated]\nPast knowledge relevant to user's message:\n${items}`;
      }
    }
  } else {
    if (!state.pending) state.pending = MISSION;
    situation += `\nNo new user messages.\n${state.pending === MISSION ? "Mission activated:" : "Continuing current pending task:"}\n  - ${state.pending}`;
  }

  const prompt = buildPrompt(state, situation, lastResult, lastActionName);

  for (let retry = 0; retry < 3; retry++) {
    if (retry > 0) console.log(`  ⟳ Retry ${retry}...`);
    const output = parseLLMResponse(await callLLM(prompt));
    if (output) return output;
  }

  console.log("  ✖ Failed to parse LLM response.");
  return null;
}

function logPlannedAction(tickNum: number, icon: string, output: LLMOutput) {
  console.log(chalk.cyan(`\n╭── Tick ${tickNum} ${icon} ──────────────────────────────────────`));
  console.log(`${chalk.cyan("│")} ${chalk.magenta("💭 Thought:")} ${chalk.italic(output.thought)}`);
  console.log(
    `${chalk.cyan("│")} ${chalk.yellow("🔧 Action:")}  ${
      output.action.tool === "respond_to_user"
        ? "respond_to_user( [hidden payload] )"
        : `${output.action.tool}(${JSON.stringify(output.action.args)})`
    }`
  );
}

async function runPlannedAction(state: State, output: LLMOutput): Promise<ToolResult> {
  const actionText = `${output.action.tool}(${JSON.stringify(output.action.args)})`;
  if ((state.last_actions.at(-1) || "").startsWith(`${actionText} -> fail:`)) {
    return {
      ok: false,
      data: null,
      error: "SYSTEM GUARD: You repeated the exact same failed action. Try a different approach.",
    };
  }

  return executeTool(output.action.tool, output.action.args, tools);
}

function logToolResult(result: ToolResult, pendingUpdate: string | null) {
  if (result.ok) {
    const preview = String(JSON.stringify(result.data) ?? result.data);
    console.log(
      `${chalk.cyan("│")} ${chalk.green("✓ Result:")}   ${chalk.dim(preview.slice(0, 200))}${
        preview.length > 200 ? "..." : ""
      }`
    );
  } else {
    console.log(`${chalk.cyan("│")} ${chalk.red("✗ Error:")}    ${result.error}`);
  }

  if (pendingUpdate) {
    console.log(`${chalk.cyan("│")} ${chalk.blue("📋 Task:")}      ${pendingUpdate}`);
  }

  console.log(chalk.cyan("╰──────────────────────────────────────────────────"));
}

async function main() {
  await initMemory();

  const input = new InputBuffer();
  let state: State = {
    mission_progress: "",
    working_memory: "",
    pending: "",
    last_actions: [],
    thought_history: [],
    chat_history: [],
  };
  
  const savedState = await loadState();
  if (savedState) {
    console.log(chalk.blue("💾 Restoring session state from database..."));
    state = {
      ...state,
      mission_progress: savedState.mission_progress || "",
      working_memory: savedState.working_memory || "",
      pending: savedState.pending || "",
      chat_history: savedState.chat_history || [],
    };
  }

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

  input.on("input", (message: string) => {
    console.log(`  📩 Buffered: "${message}"`);
  });

  input.on("close", () => {
    running = false;
  });

  const heartbeat = async () => {
    if (!running || tickInProgress) return;
    tickInProgress = true;

    try {
      tickNum++;
      const messages = input.drain();
      const hasInput = messages.length > 0;
      const hasPending = Boolean(state.pending);

      if (messages.some((message) => /^(exit|quit)$/i.test(message))) {
        console.log("\n👋 Goodbye.\n");
        running = false;
        input.close();
        clearInterval(timer);
        process.exit(0);
        return;
      }

      if (!hasInput && !hasPending) {
        idleTicks++;
        if (idleTicks > MAX_IDLE_TICKS) return;
      } else {
        idleTicks = 0;
      }

      const icon = hasInput ? "💬" : hasPending ? "⚙️" : "⏳";
      const output = await tick(state, messages, lastResult, lastActionName);
      if (!output) return;

      lastActionName = output.action.tool;

      if (output.action.tool === "wait" || output.action.tool === "noop") {
        input.setPromptStatus(chalk.dim(`[Tick ${tickNum}] ${icon} Standby...`));
        state = updateState(state, output, { ok: true, data: null });
        lastResult = { ok: true, data: null };
        return;
      }

      input.setPromptStatus(chalk.green(`[Tick ${tickNum}] ⚙ Active...`));
      logPlannedAction(tickNum, icon, output);
      const toolResult = await runPlannedAction(state, output);
      state = updateState(state, output, toolResult);
      lastResult = toolResult;
      logToolResult(toolResult, output.pending_update);

      // Persist state
      await upsertState({
        mission_progress: state.mission_progress,
        working_memory: state.working_memory,
        pending: state.pending,
        chat_history: state.chat_history
      });

      if (output.action.tool === "respond_to_user" && toolResult.ok && messages.length > 0) {
        await autoStoreMemory(state, messages.join(" "), String(output.action.args.text));
      }
    } finally {
      tickInProgress = false;
    }
  };

  const timer = setInterval(heartbeat, TICK_INTERVAL_MS);
  await heartbeat();
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
