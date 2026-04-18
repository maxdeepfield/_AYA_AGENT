import "dotenv/config";
import chalk from "chalk";
import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import { Ollama } from "ollama";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { InputBuffer } from "./input.js";
import { initMemory, searchEngrams, writeEngram, loadState, upsertState } from "./memory.js";
import { executeTool, tools, setScheduledTasksRef } from "./tools.js";
import { DEFAULT_DIRECTIVES, DEFAULT_MISSION, SYSTEM_PROMPT_TEMPLATE } from "./prompts.js";
import type { LLMOutput, State, ToolResult } from "./types.js";

const MODEL = process.env.OLLAMA_MODEL || "Bored/gigachat3-10B-A1.8:latest";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const TICK_INTERVAL_MS = Number.parseInt(process.env.TICK_INTERVAL || "5000", 10);
const MAX_IDLE_TICKS = Number.parseInt(process.env.MAX_IDLE || "999999", 10);
const DIRECTIVES = process.env.DIRECTIVES || DEFAULT_DIRECTIVES;
const MISSION = process.env.MISSION || DEFAULT_MISSION;
const PORT = Number.parseInt(process.env.PORT || "3000", 10);

// Setup logging
const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOGS_DIR, `run_${new Date().toISOString().replace(/[:.]/g, "-")}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Create log stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });

// Log function that writes to both console and file
function log(message: string, skipConsole = false) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  logStream.write(logLine);
  if (!skipConsole) {
    // Strip ANSI codes for file, keep for console
    process.stdout.write(message + "\n");
  }
}

// Override console.log to also write to file
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.map(arg => typeof arg === "string" ? arg : JSON.stringify(arg)).join(" ");
  // Remove ANSI color codes for file logging
  const cleanMessage = message.replace(/\x1b\[[0-9;]*m/g, "");
  logStream.write(`[${new Date().toISOString()}] ${cleanMessage}\n`);
  originalConsoleLog(...args);
};

const ollama = new Ollama({ host: OLLAMA_HOST });
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Global emitter for tools to access socket
export const socketEvents = {
  emit: (event: string, data: any) => io.emit(event, data),
};

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

  const awaitingText = state.awaiting_answer
    ? `\n⚠️ AWAITING USER ANSWER to your question: "${state.awaiting_answer.question}"\nNext user message will be their answer.`
    : "";

  return SYSTEM_PROMPT_TEMPLATE
    .replace("{DIRECTIVES}", DIRECTIVES)
    .replace("{MISSION}", MISSION)
    .replace("{mission_progress}", state.mission_progress || "none")
    .replace("{working_memory}", state.working_memory || "empty")
    .replace("{pending}", state.pending || "nothing pending")
    .replace("{recent_thoughts}", state.thought_history.slice(-3).join(" -> ") || "none")
    .replace("{recent_actions}", state.last_actions.length ? state.last_actions.join(", ") : "none")
    .replace("{result_text}", resultText)
    .replace("{chat_text}", chatText + awaitingText)
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

  // Handle ask_user tool
  let awaitingAnswer = state.awaiting_answer;
  if (output.action.tool === "ask_user" && result.ok) {
    awaitingAnswer = {
      question: String(output.action.args.question),
      asked_at: Date.now(),
    };
  } else if (output.action.tool === "respond_to_user" && result.ok && state.awaiting_answer) {
    // Clear awaiting_answer after responding
    awaitingAnswer = null;
  }

  return {
    ...state,
    working_memory:
      output.action.tool === "consolidate_thoughts" && result.ok
        ? String(output.action.args.new_working_memory)
        : state.working_memory,
    pending:
      // Clear pending after successful respond_to_user if no explicit pending_update
      output.action.tool === "respond_to_user" && result.ok && output.pending_update === null
        ? MISSION
        : output.pending_update !== null
        ? output.pending_update
        : state.pending,
    last_actions: [...state.last_actions, actionText].slice(-3),
    thought_history: [...state.thought_history, output.thought].slice(-5),
    chat_history:
      output.action.tool === "respond_to_user" && result.ok
        ? [...state.chat_history, { role: "agent", content: String(output.action.args.text) }].slice(-10)
        : output.action.tool === "ask_user" && result.ok
        ? [...state.chat_history, { role: "agent", content: String(output.action.args.question) }].slice(-10)
        : state.chat_history.slice(-10),
    awaiting_answer: awaitingAnswer,
    scheduled_tasks: state.scheduled_tasks,
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
    // If we're awaiting an answer, treat first message as the answer
    if (state.awaiting_answer) {
      situation += `\n⚠️ USER ANSWERED YOUR QUESTION!\nYour question was: "${state.awaiting_answer.question}"\nUser's answer: "${userMessages[0]}"`;
      if (userMessages.length > 1) {
        situation += `\nAdditional messages:\n${userMessages.slice(1).map((m) => `  - "${m}"`).join("\n")}`;
      }
    } else {
      situation += `\nNew user messages:\n${userMessages.map((message) => `  - "${message}"`).join("\n")}`;
    }
    
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
    
    // Check if this is a scheduled task
    const isScheduledTask = state.scheduled_tasks.some(t => t.task === state.pending);
    
    if (isScheduledTask) {
      situation += `\n⚠️ SCHEDULED TASK TRIGGERED!\nYou MUST execute this task now:\n  - ${state.pending}`;
    } else {
      situation += `\nNo new user messages.\n${state.pending === MISSION ? "Mission activated:" : "Continuing current pending task:"}\n  - ${state.pending}`;
    }
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

async function runPlannedAction(state: State, output: LLMOutput): Promise<ToolResult> {
  const actionText = `${output.action.tool}(${JSON.stringify(output.action.args)})`;
  
  // Guard: Don't repeat the exact same failed action
  if ((state.last_actions.at(-1) || "").startsWith(`${actionText} -> fail:`)) {
    return {
      ok: false,
      data: null,
      error: "SYSTEM GUARD: You repeated the exact same failed action. Try a different approach.",
    };
  }
  
  // Guard: Warn if multiple consecutive failures (but allow the attempt)
  const recentFailures = state.last_actions.filter(a => a.includes("-> fail:")).length;
  if (recentFailures >= 2 && !output.action.tool.includes("ask_user")) {
    console.log(chalk.yellow(`  ⚠️  WARNING: ${recentFailures} recent failures. Consider asking user for help or trying different approach.`));
  }
  
  // Guard: Warn if too many research actions without user interaction
  const recentResearch = state.last_actions.filter(a => 
    a.includes("web_search") || a.includes("fetch_url") || a.includes("write_engram")
  ).length;
  if (recentResearch >= 2 && !output.action.tool.includes("respond_to_user") && !output.action.tool.includes("consolidate_thoughts")) {
    console.log(chalk.yellow(`  ⚠️  WARNING: ${recentResearch} consecutive research actions. Consider consolidating or reporting to user.`));
  }
  
  // Guard: Warn if web_search without fetch_url (shallow research)
  if (output.action.tool === "web_search") {
    const recentActions = state.last_actions.slice(-5);
    const hasRecentSearch = recentActions.some(a => a.includes("web_search"));
    const hasRecentFetch = recentActions.some(a => a.includes("fetch_url"));
    
    if (hasRecentSearch && !hasRecentFetch) {
      console.log(chalk.yellow(`  ⚠️  WARNING: Multiple web_search without fetch_url. Snippets are too short - fetch full content!`));
    }
  }
  
  // Guard: Don't consolidate with the same or very similar content
  if (output.action.tool === "consolidate_thoughts") {
    const newMemory = String(output.action.args.new_working_memory || "").trim();
    const currentMemory = (state.working_memory || "").trim();
    
    // Exact match
    if (newMemory === currentMemory) {
      return {
        ok: false,
        data: null,
        error: "SYSTEM GUARD: You're trying to consolidate with the exact same content. Memory is already consolidated. Try clearing it with empty string or do something else.",
      };
    }
    
    // Very similar (>90% overlap)
    if (newMemory.length > 20 && currentMemory.length > 20) {
      const similarity = calculateSimilarity(newMemory, currentMemory);
      if (similarity > 0.9) {
        return {
          ok: false,
          data: null,
          error: `SYSTEM GUARD: New memory is ${Math.round(similarity * 100)}% similar to current memory. Don't spam consolidation. Try a different action or clear memory with empty string.`,
        };
      }
    }
  }
  
  // Guard: Don't repeat the same web_search query within last 3 actions
  if (output.action.tool === "web_search") {
    const query = String(output.action.args.query || "").toLowerCase().trim();
    const recentSearches = state.last_actions
      .filter(a => a.includes("web_search"))
      .map(a => {
        const match = a.match(/web_search\(\{"query":"([^"]+)"\}/);
        return match ? match[1].toLowerCase().trim() : "";
      })
      .filter(Boolean);
    
    if (recentSearches.includes(query)) {
      return {
        ok: false,
        data: null,
        error: `SYSTEM GUARD: You already searched for "${query}" recently. Try a different query or use a different tool.`,
      };
    }
  }

  return executeTool(output.action.tool, output.action.args, tools);
}

// Simple similarity calculation (Jaccard similarity on words)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
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
    pending: MISSION,
    last_actions: [],
    thought_history: [],
    chat_history: [],
    awaiting_answer: null,
    scheduled_tasks: [],
  };
  
  setScheduledTasksRef(state.scheduled_tasks);
  
  const savedState = await loadState();
  if (savedState) {
    console.log(chalk.blue("💾 Restoring session state from database..."));
    state = {
      ...state,
      mission_progress: savedState.mission_progress || "",
      working_memory: savedState.working_memory || "",
      pending: savedState.pending || MISSION,
      chat_history: savedState.chat_history || [],
      awaiting_answer: null,
      scheduled_tasks: savedState.scheduled_tasks || [],
    };
    setScheduledTasksRef(state.scheduled_tasks);
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
  console.log(`${chalk.blue("📝")} Log: ${chalk.whiteBright(path.basename(LOG_FILE))}`);
  console.log(chalk.gray("  Interactive mode enabled. Type queries or 'exit' to quit."));
  console.log(chalk.cyan("══════════════════════════════════════════════════════════\n"));

  input.on("input", (message: string) => {
    console.log(`  📩 Buffered (Console): "${message}"`);
    io.emit("chat_update", { role: "user", content: message });
  });

  io.on("connection", (socket) => {
    console.log(chalk.blue(`📱 Client connected: ${socket.id}`));
    
    // Send current history to new client
    socket.emit("sync_state", {
      chat_history: state.chat_history,
      mission_progress: state.mission_progress,
      pending: state.pending,
      awaiting_answer: state.awaiting_answer,
    });

    socket.on("message", (msg: string) => {
      console.log(`  📩 Buffered (App): "${msg}"`);
      input.push(msg); // Inject into agent's input queue
    });

    socket.on("disconnect", () => {
      console.log(chalk.gray(`📱 Client disconnected: ${socket.id}`));
    });
  });

  httpServer.listen(PORT, () => {
    console.log(chalk.cyan(`📡 Socket server listening on port ${PORT}`));
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
      
      // Check scheduled tasks BEFORE checking hasPending
      const now = Date.now();
      for (const task of state.scheduled_tasks) {
        if (now >= task.next_execution) {
          // Add task to pending if not busy
          if (!state.pending || state.pending === MISSION) {
            state.pending = task.task;
            console.log(chalk.yellow(`  ⏰ Scheduled task triggered: ${task.task}`));
          }
          
          // Update next execution
          task.last_executed = now;
          task.next_execution = now + task.interval_minutes * 60 * 1000;
        }
      }
      
      // Calculate hasPending AFTER scheduled tasks check
      const hasPending = Boolean(state.pending || state.awaiting_answer);

      if (messages.some((message) => /^(exit|quit)$/i.test(message))) {
        console.log("\n👋 Goodbye.\n");
        console.log(chalk.gray(`📝 Session log saved to: ${LOG_FILE}`));
        running = false;
        input.close();
        logStream.end();
        clearInterval(timer);
        tickInProgress = false;
        process.exit(0);
        return;
      }

      if (!hasInput && !hasPending) {
        idleTicks++;
        if (idleTicks > MAX_IDLE_TICKS) {
          tickInProgress = false;
          return;
        }
      } else {
        idleTicks = 0;
      }
      
      // If awaiting answer and no user input, skip this tick
      if (state.awaiting_answer && !hasInput) {
        tickInProgress = false;
        return;
      }

      const icon = hasInput ? "💬" : hasPending ? "⚙️" : "⏳";
      
      // Show tick started
      console.log(chalk.cyan(`\n╭── Tick ${tickNum} ${icon} ──────────────────────────────────────`));
      
      const output = await tick(state, messages, lastResult, lastActionName);
      
      if (!output) {
        console.log(chalk.red(`${chalk.cyan("│")} ✖ Failed to get LLM response`));
        console.log(chalk.cyan("╰──────────────────────────────────────────────────"));
        tickInProgress = false;
        return;
      }

      lastActionName = output.action.tool;

      // Log thought and action
      console.log(`${chalk.cyan("│")} ${chalk.magenta("💭 Thought:")} ${chalk.italic(output.thought)}`);
      console.log(
        `${chalk.cyan("│")} ${chalk.yellow("🔧 Action:")}  ${
          output.action.tool === "respond_to_user"
            ? "respond_to_user( [hidden payload] )"
            : `${output.action.tool}(${JSON.stringify(output.action.args)})`
        }`
      );
      
      const toolResult = await runPlannedAction(state, output);
      state = updateState(state, output, toolResult);
      lastResult = toolResult;
      logToolResult(toolResult, output.pending_update);

      // Persist state
      await upsertState({
        mission_progress: state.mission_progress,
        working_memory: state.working_memory,
        pending: state.pending,
        chat_history: state.chat_history,
        scheduled_tasks: state.scheduled_tasks,
      });

      if (output.action.tool === "respond_to_user" && toolResult.ok && messages.length > 0) {
        await autoStoreMemory(state, messages.join(" "), String(output.action.args.text));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Tick ${tickNum} failed: ${error.message}`));
    } finally {
      tickInProgress = false;
    }
  };

  const timer = setInterval(heartbeat, TICK_INTERVAL_MS);
  
  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Exiting (Ctrl+C)...");
    console.log(chalk.gray(`📝 Session log saved to: ${LOG_FILE}`));
    logStream.end();
    clearInterval(timer);
    process.exit(0);
  });
  
  // Don't call heartbeat() immediately - let the interval handle it
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  logStream.end();
  process.exit(1);
});
