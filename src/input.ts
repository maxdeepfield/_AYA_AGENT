import * as readline from "node:readline";
import { EventEmitter } from "node:events";
import chalk from "chalk";

// ── Async input buffer ─────────────────────────────────
// Reads stdin line-by-line, buffers messages.
// Each tick drains the buffer.

export class InputBuffer extends EventEmitter {
  private buffer: string[] = [];
  public rl: readline.Interface;

  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.yellow("❯ "),
    });

    // Intercept console.log to keep the prompt at the bottom
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      process.stdout.write("\x1b[2K\r"); // clear prompt
      originalLog.apply(console, args);  // print content
      this.rl.prompt(true);              // redraw prompt and typed text
    };

    // Keep process.stdout.write safe too for our Thinker streams
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: string | Uint8Array, cb?: any) => {
      // If we are writing something manually (like chunks of <think>), we shouldn't wipe rl completely
      // but for simplicity, we just pass it through. readline handles partial writes decently if we redraw
      return originalWrite(chunk, cb);
    };

    this.rl.prompt();

    this.rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed === "exit" || trimmed === "quit") {
        console.log(chalk.red("\n👋 System Offline."));
        process.exit(0);
      }
      if (trimmed) {
        this.buffer.push(trimmed);
        
        // Remove the line the user just typed (we will redraw it beautifully)
        process.stdout.write("\x1b[1A\x1b[2K\r");
        
        console.log(chalk.blue("╭──────────────────────────────────────────────────"));
        console.log(`${chalk.blue("│")} ${chalk.cyanBright("👤 You:")} ${chalk.white(trimmed)}`);
        console.log(chalk.blue("╰──────────────────────────────────────────────────"));
        
        this.emit("input", trimmed);
      } else {
        // user pressed enter on empty line, just redraw prompt
        this.rl.prompt();
      }
    });

    // Handle Ctrl+C properly since readline intercepts it
    this.rl.on("SIGINT", () => {
      console.log("\n👋 Exiting (Ctrl+C)...");
      process.exit(0);
    });

    this.rl.on("close", () => {
      this.emit("close");
    });
  }

  /** Drain all buffered messages since last call */
  drain(): string[] {
    const messages = [...this.buffer];
    this.buffer = [];
    return messages;
  }

  /** Check if there are pending messages */
  hasPending(): boolean {
    return this.buffer.length > 0;
  }

  setPromptStatus(statusText: string) {
    this.rl.setPrompt(`${statusText} ${chalk.yellow("❯ ")}`);
    this.rl.prompt(true); // Redraw immediately
  }

  close(): void {
    this.rl.close();
  }
}
