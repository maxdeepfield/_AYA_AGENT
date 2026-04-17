import { EventEmitter } from "node:events";
import * as readline from "node:readline";
import chalk from "chalk";

export class InputBuffer extends EventEmitter {
  private buffer: string[] = [];
  private isClosed = false;
  private readonly originalLog = console.log;
  readonly rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.yellow("❯ "),
  });

  constructor() {
    super();

    // Hijack console.log to preserve prompt
    console.log = (...args: unknown[]) => {
      if (!this.isClosed) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      }
      this.originalLog(...args);
      if (!this.isClosed) {
        this.rl.prompt(true);
      }
    };

    this.rl.prompt();

    this.rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        this.rl.prompt();
        return;
      }

      this.buffer.push(trimmed);
      process.stdout.write("\x1b[1A\x1b[2K\r");
      console.log(chalk.blue("╭──────────────────────────────────────────────────"));
      console.log(`${chalk.blue("│")} ${chalk.cyanBright("👤 You:")} ${chalk.white(trimmed)}`);
      console.log(chalk.blue("╰──────────────────────────────────────────────────"));
      this.emit("input", trimmed);
    });

    this.rl.on("SIGINT", () => {
      console.log("\n👋 Exiting (Ctrl+C)...");
      process.exit(0);
    });

    this.rl.on("close", () => {
      this.isClosed = true;
      this.emit("close");
    });
  }

  drain(): string[] {
    const messages = this.buffer;
    this.buffer = [];
    return messages;
  }

  push(message: string) {
    this.buffer.push(message);
    this.emit("input", message);
  }

  setPromptStatus(statusText: string) {
    if (this.isClosed) return;
    this.rl.setPrompt(`${statusText}\n${chalk.yellow("❯ ")}`);
    this.rl.prompt(true);
  }

  close() {
    this.rl.close();
  }
}
