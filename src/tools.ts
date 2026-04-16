import * as fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";
import type { ToolDef, ToolRegistry, ToolResult } from "./types.js";
import { writeEngram, searchEngrams } from "./memory.js";

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
    
    let finalCmd = command;
    if (process.platform === 'win32') {
       finalCmd = `chcp 65001 > nul & ${command}`;
    }

    try {
      const { stdout, stderr } = await execAsync(finalCmd, { timeout: 15000 });
      return { 
        ok: true, 
        data: { 
          stdout: stdout.slice(0, 1000), 
          stderr: stderr.slice(0, 1000) 
        } 
      };
    } catch (e: any) {
      let msg = e.message || String(e);
      let out = e.stdout || '';
      let err = e.stderr || '';
      
      if (process.platform === 'win32') {
         msg = msg.replace("chcp 65001 > nul & ", "");
      }
      
      return { 
        ok: false, 
        data: null, 
        error: `Command failed: ${msg}. stdout: ${out.slice(0, 500)}. stderr: ${err.slice(0, 500)}`
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
  fetch_url: {
    description: "Read the text content of a URL. Args: { url: string }",
    async execute(args): Promise<ToolResult> {
      const url = args.url as string;
      if (!url) return { ok: false, data: null, error: "Missing 'url'" };

      try {
        const response = await fetch(url);
        if (!response.ok) {
          return { ok: false, data: null, error: `HTTP ${response.status} ${response.statusText}` };
        }
        
        let text = await response.text();
        
        // Basic HTML stripping to protect context window
        if (text.includes("<html") || text.includes("<body")) {
           // strip scripts and styles
           text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
                      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
           // strip tags
           text = text.replace(/<[^>]+>/g, " ");
           // collapse spaces
           text = text.replace(/\s+/g, " ").trim();
        }
        
        // Truncate to a safe limit, 5000 chars is roughly 1000-1500 tokens
        if (text.length > 5000) {
           text = text.slice(0, 5000) + "... [truncated]";
        }

        return { ok: true, data: { url, content: text } };
      } catch (e: any) {
        return { ok: false, data: null, error: e.message };
      }
    },
  },
  
  // ── New Memory Tools ─────────────────────────────────
  
  write_engram: {
    description: "Write a permanent episodic memory to the RAG vector database. Args: { topic: string, text: string }",
    async execute(args): Promise<ToolResult> {
      const topic = args.topic as string;
      const text = args.text as string;
      if (!topic || !text) return { ok: false, data: null, error: "Missing 'topic' or 'text'" };
      
      const res = await writeEngram(topic, text);
      if (!res.ok) return { ok: false, data: null, error: res.error };
      return { ok: true, data: { mem_id: res.id, status: "Saved to subconscious memory." } };
    }
  },
  
  search_engrams: {
    description: "Search subconscious memory via vector similarity. Args: { query: string }",
    async execute(args): Promise<ToolResult> {
      const query = args.query as string;
      if (!query) return { ok: false, data: null, error: "Missing 'query'" };
      
      const res = await searchEngrams(query, 3);
      if (!res.ok) return { ok: false, data: null, error: res.error };
      return { ok: true, data: { results: res.results } };
    }
  },
  
  consolidate_thoughts: {
    description: "Overwrite your internal working memory to compact it. USE THIS to clear out noise and retain ONLY vital facts as bullet points. Args: { new_working_memory: string }",
    async execute(args): Promise<ToolResult> {
      const mem = args.new_working_memory as string;
      if (mem === undefined) return { ok: false, data: null, error: "Missing 'new_working_memory'" };
      return { ok: true, data: { consolidated: true, new_memory_length: mem.length } };
      // Note: The actual state mutation happens in the Controller 
    }
  }
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
