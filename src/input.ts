import * as readline from "node:readline";
import { EventEmitter } from "node:events";

// ── Async input buffer ─────────────────────────────────
// Reads stdin line-by-line, buffers messages.
// Each tick drains the buffer.

export class InputBuffer extends EventEmitter {
  private buffer: string[] = [];
  private rl: readline.Interface;

  constructor() {
    super();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "",
    });

    this.rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed === "exit" || trimmed === "quit") {
        console.log("\n👋 Exiting...");
        process.exit(0);
      }
      if (trimmed) {
        this.buffer.push(trimmed);
        this.emit("input", trimmed);
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

  close(): void {
    this.rl.close();
  }
}
