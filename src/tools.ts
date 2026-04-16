import * as fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";
import type { ToolDef, ToolRegistry, ToolResult } from "./types.js";

const execAsync = promisify(exec);

// ── Tool: respond_to_user ──────────────────────────────

const respond_to_user: ToolDef = {
  description: "Send a message to the user. Args: { text: string }",
  async execute(args): Promise<ToolResult> {
    const text = args.text as string;
    if (!text) return { ok: false, data: null, error: "Missing 'text'" };
    
    console.log(`\n${chalk.cyan("╭──────────────────────────────────────────────────")}`);
    console.log(`${chalk.cyan("│")} ${chalk.greenBright("🤖 AYA:")} ${chalk.whiteBright(text)}`);
    console.log(`${chalk.cyan("╰──────────────────────────────────────────────────")}`);
    
    return { ok: true, data: { delivered: true } };
  },
};

// ── Tool: read_file ────────────────────────────────────

const read_file: ToolDef = {
  description: "Read contents of a file. Args: { path: string }",
  async execute(args): Promise<ToolResult> {
    const path = args.path as string;
    if (!path) return { ok: false, data: null, error: "Missing 'path' argument" };
    try {
      const content = await fs.readFile(path, "utf-8");
      return { ok: true, data: { content } };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

// ── Tool: write_file ───────────────────────────────────

const write_file: ToolDef = {
  description: "Write content to a file. Args: { path: string, content: string }",
  async execute(args): Promise<ToolResult> {
    const path = args.path as string;
    const content = args.content as string;
    if (!path || content === undefined)
      return { ok: false, data: null, error: "Missing 'path' or 'content'" };
    try {
      await fs.writeFile(path, content, "utf-8");
      return { ok: true, data: { written: true } };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

// ── Tool: web_search ───────────────────────────────────

const web_search: ToolDef = {
  description: "Search the web using Serper API. Args: { query: string }",
  async execute(args): Promise<ToolResult> {
    const query = args.query as string;
    if (!query) return { ok: false, data: null, error: "Missing 'query'" };
    
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) return { ok: false, data: null, error: "SERPER_API_KEY is not set in environment" };

    try {
      const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: query })
      });
      if (!resp.ok) {
         return { ok: false, data: null, error: `Serper error: ${resp.statusText}` };
      }
      const json = await resp.json();
      
      // Return top 3 organic results
      const results = (json.organic || []).slice(0, 3).map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet
      }));
      
      return { ok: true, data: { results } };
    } catch (e: any) {
      return { ok: false, data: null, error: e.message };
    }
  },
};

// ── Tool: run_command ──────────────────────────────────

const run_command: ToolDef = {
  description: "Run a shell/bash command on the host system. Args: { command: string }",
  async execute(args): Promise<ToolResult> {
    const command = args.command as string;
    if (!command) return { ok: false, data: null, error: "Missing 'command' argument" };
    
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 15000 });
      return { 
        ok: true, 
        data: { 
          stdout: stdout.slice(0, 1000), 
          stderr: stderr.slice(0, 1000) 
        } 
      };
    } catch (e: any) {
      return { 
        ok: false, 
        data: null, 
        error: `Command failed: ${e.message}. stdout: ${e.stdout?.slice(0, 500) || ''}. stderr: ${e.stderr?.slice(0, 500) || ''}`
      };
    }
  },
};

// ── Registry ───────────────────────────────────────────

export const tools: ToolRegistry = {
  respond_to_user,
  read_file,
  write_file,
  web_search,
  run_command,
};

// ── Execute by name ────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  registry: ToolRegistry
): Promise<ToolResult> {
  if (name === "noop") {
    return { ok: true, data: { noop: true } };
  }

  const tool = registry[name];
  if (!tool) {
    return { ok: false, data: null, error: `Unknown tool: ${name}` };
  }

  try {
    return await tool.execute(args);
  } catch (e: any) {
    return { ok: false, data: null, error: `Tool crash: ${e.message}` };
  }
}
