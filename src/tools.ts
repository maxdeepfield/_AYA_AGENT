import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";
import chalk from "chalk";
import { searchEngrams, writeEngram } from "./memory.js";
import type { ToolDef, ToolRegistry, ToolResult } from "./types.js";

const execAsync = promisify(exec);

// Global scheduled tasks storage (will be passed from main)
let scheduledTasksRef: any = null;

export function setScheduledTasksRef(ref: any) {
  scheduledTasksRef = ref;
}

const respond_to_user: ToolDef = {
  description: "Send a message to the user. Args: { text: string }",
  async execute(args): Promise<ToolResult> {
    const text = args.text as string;
    if (!text) return { ok: false, data: null, error: "Missing 'text'" };

    console.log(`\n${chalk.cyan("╭──────────────────────────────────────────────────")}`);
    console.log(`${chalk.cyan("│")} ${chalk.greenBright("🤖 AYA:")} ${chalk.whiteBright(text)}`);
    console.log(`${chalk.cyan("╰──────────────────────────────────────────────────")}`);
    
    // Send to web/mobile client
    const { socketEvents } = await import("./main.js");
    socketEvents.emit("chat_update", { role: "agent", content: text });

    return { ok: true, data: { delivered: true } };
  },
};

const ask_user: ToolDef = {
  description: "Ask the user a question and wait for their answer. Use this when you need information from the user. Args: { question: string }",
  async execute(args): Promise<ToolResult> {
    const question = args.question as string;
    if (!question) return { ok: false, data: null, error: "Missing 'question'" };

    console.log(`\n${chalk.cyan("╭──────────────────────────────────────────────────")}`);
    console.log(`${chalk.cyan("│")} ${chalk.yellowBright("❓ AYA:")} ${chalk.whiteBright(question)}`);
    console.log(`${chalk.cyan("╰──────────────────────────────────────────────────")}`);
    
    // Send to web/mobile client
    const { socketEvents } = await import("./main.js");
    socketEvents.emit("chat_update", { role: "agent", content: question, type: "question" });

    return { 
      ok: true, 
      data: { 
        question_asked: true,
        awaiting_answer: true,
        asked_at: Date.now()
      } 
    };
  },
};

const read_file: ToolDef = {
  description: "Read contents of a file. Args: { path: string }",
  async execute(args): Promise<ToolResult> {
    const filePath = args.path as string;
    if (!filePath) return { ok: false, data: null, error: "Missing 'path' argument" };

    try {
      return { ok: true, data: { content: await fs.readFile(filePath, "utf-8") } };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

const write_file: ToolDef = {
  description: "Write content to a file. Args: { path: string, content: string }",
  async execute(args): Promise<ToolResult> {
    const filePath = args.path as string;
    const content = args.content as string;
    if (!filePath || content === undefined) {
      return { ok: false, data: null, error: "Missing 'path' or 'content'" };
    }

    try {
      await fs.writeFile(filePath, content, "utf-8");
      return { ok: true, data: { written: true } };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

const web_search: ToolDef = {
  description: "Search the web using Serper API. Returns title, link, and SHORT SNIPPET (not full content). Use fetch_url after to read full pages. Args: { query: string }",
  async execute(args): Promise<ToolResult> {
    const query = args.query as string;
    const apiKey = process.env.SERPER_API_KEY;
    if (!query) return { ok: false, data: null, error: "Missing 'query'" };
    if (!apiKey) return { ok: false, data: null, error: "SERPER_API_KEY is not set in environment" };

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        return { ok: false, data: null, error: `Serper error: ${response.statusText}` };
      }

      const json = await response.json();
      return {
        ok: true,
        data: {
          results: (json.organic || []).slice(0, 3).map((result: any) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
          })),
        },
      };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

const run_command: ToolDef = {
  description: "Run a windows terminal/cmd command on the host system from the current working directory. Args: { command: string }",
  async execute(args): Promise<ToolResult> {
    const command = args.command as string;
    if (!command) return { ok: false, data: null, error: "Missing 'command' argument" };

    const isRobocopy = /^robocopy(?:\.exe)?\b/i.test(command.trim());
    const finalCommand = process.platform === "win32" ? `chcp 65001 > nul & ${command}` : command;

    try {
      const { stdout, stderr } = await execAsync(finalCommand, { timeout: 15000 });
      return {
        ok: true,
        data: {
          stdout: stdout.slice(0, 1000),
          stderr: stderr.slice(0, 1000),
        },
      };
    } catch (e: any) {
      const stdout = (e.stdout || "").slice(0, 1000);
      const stderr = (e.stderr || "").slice(0, 1000);
      const exitCode = typeof e.code === "number" ? e.code : null;
      const message = String(e.message || e).replace("chcp 65001 > nul & ", "");

      if (isRobocopy && exitCode !== null && exitCode < 8) {
        return { ok: true, data: { stdout, stderr, exit_code: exitCode } };
      }

      return {
        ok: false,
        data: null,
        error: `Command failed: ${message}. stdout: ${stdout.slice(0, 500)}. stderr: ${stderr.slice(0, 500)}`,
      };
    }
  },
};

export const tools: ToolRegistry = {
  respond_to_user,
  ask_user,
  schedule_task: {
    description: "Schedule a recurring task. Args: { task: string, interval_minutes: number }. Example: schedule_task({ task: 'fetch news', interval_minutes: 10 })",
    async execute(args): Promise<ToolResult> {
      const task = args.task as string;
      const interval = args.interval_minutes as number;
      
      if (!task || !interval) {
        return { ok: false, data: null, error: "Missing 'task' or 'interval_minutes'" };
      }
      
      if (!scheduledTasksRef) {
        return { ok: false, data: null, error: "Scheduled tasks not initialized" };
      }
      
      const taskId = `task_${Date.now()}`;
      const now = Date.now();
      
      scheduledTasksRef.push({
        id: taskId,
        task,
        interval_minutes: interval,
        last_executed: 0,
        next_execution: now + interval * 60 * 1000,
      });
      
      return {
        ok: true,
        data: {
          task_id: taskId,
          task,
          interval_minutes: interval,
          next_execution: new Date(now + interval * 60 * 1000).toISOString(),
        },
      };
    },
  },
  list_scheduled_tasks: {
    description: "List all scheduled recurring tasks",
    async execute(): Promise<ToolResult> {
      if (!scheduledTasksRef) {
        return { ok: false, data: null, error: "Scheduled tasks not initialized" };
      }
      
      return {
        ok: true,
        data: {
          tasks: scheduledTasksRef.map((t: any) => ({
            id: t.id,
            task: t.task,
            interval_minutes: t.interval_minutes,
            next_execution: new Date(t.next_execution).toISOString(),
          })),
        },
      };
    },
  },
  cancel_scheduled_task: {
    description: "Cancel a scheduled task. Args: { task_id: string }",
    async execute(args): Promise<ToolResult> {
      const taskId = args.task_id as string;
      
      if (!taskId) {
        return { ok: false, data: null, error: "Missing 'task_id'" };
      }
      
      if (!scheduledTasksRef) {
        return { ok: false, data: null, error: "Scheduled tasks not initialized" };
      }
      
      const index = scheduledTasksRef.findIndex((t: any) => t.id === taskId);
      if (index === -1) {
        return { ok: false, data: null, error: `Task ${taskId} not found` };
      }
      
      const removed = scheduledTasksRef.splice(index, 1)[0];
      return { ok: true, data: { cancelled: removed } };
    },
  },
  read_file,
  write_file,
  web_search,
  run_command,
  fetch_url: {
    description: "Fetch and read FULL content from a URL (use after web_search to read complete articles). Strips HTML and returns text. Args: { url: string }",
    async execute(args): Promise<ToolResult> {
      const url = args.url as string;
      if (!url) return { ok: false, data: null, error: "Missing 'url'" };

      try {
        const response = await fetch(url);
        if (!response.ok) {
          return { ok: false, data: null, error: `HTTP ${response.status} ${response.statusText}` };
        }

        let content = await response.text();
        if (content.includes("<html") || content.includes("<body")) {
          content = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }

        if (content.length > 5000) {
          content = `${content.slice(0, 5000)}... [truncated]`;
        }

        return { ok: true, data: { url, content } };
      } catch (e: any) {
        return { ok: false, data: null, error: e.message };
      }
    },
  },
  write_engram: {
    description: "Write a permanent episodic memory to the RAG vector database. Args: { topic: string, text: string }",
    async execute(args): Promise<ToolResult> {
      const topic = args.topic as string;
      const text = args.text as string;
      if (!topic || !text) return { ok: false, data: null, error: "Missing 'topic' or 'text'" };

      const result = await writeEngram(topic, text);
      if (!result.ok) return { ok: false, data: null, error: result.error };
      return { ok: true, data: { mem_id: result.id, status: "Saved to subconscious memory." } };
    },
  },
  search_engrams: {
    description: "Search subconscious memory via vector similarity. Args: { query: string }",
    async execute(args): Promise<ToolResult> {
      const query = args.query as string;
      if (!query) return { ok: false, data: null, error: "Missing 'query'" };

      const result = await searchEngrams(query, 3);
      if (!result.ok) return { ok: false, data: null, error: result.error };
      return { ok: true, data: { results: result.results } };
    },
  },
  consolidate_thoughts: {
    description: "Overwrite your internal working memory to compact it. Retain only vital facts. Args: { new_working_memory: string }",
    async execute(args): Promise<ToolResult> {
      const memory = args.new_working_memory as string;
      if (memory === undefined) {
        return { ok: false, data: null, error: "Missing 'new_working_memory'" };
      }
      return { ok: true, data: { consolidated: true, new_memory_length: memory.length } };
    },
  },
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  registry: ToolRegistry
): Promise<ToolResult> {
  const tool = registry[name];
  if (!tool) {
    return { ok: false, data: null, error: `Unknown tool: ${name}. Available tools: ${Object.keys(registry).join(", ")}` };
  }

  try {
    return await tool.execute(args);
  } catch (e: any) {
    return { ok: false, data: null, error: `Tool crash: ${e.message}` };
  }
}
