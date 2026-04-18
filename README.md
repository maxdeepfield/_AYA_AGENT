# AYA Agent 🤖

**Persistent OS-level AI agent with episodic memory, scheduled tasks, and multi-platform support.**

AYA is a local AI agent that runs continuously, helping you with tasks through console and mobile app. It features vector-based episodic memory, scheduled recurring tasks, and proactive assistance.

---

## ✨ Features

### Core Capabilities
- 🔄 **Persistent Agent Loop** — Runs continuously with heartbeat-based execution
- 🧠 **Episodic Memory (RAG)** — Vector-based memory storage using MongoDB + Ollama embeddings
- ⏰ **Scheduled Tasks** — Set recurring tasks (e.g., "give me news every 10 minutes")
- 💬 **Multi-Platform** — Console interface + React Native mobile app via Socket.IO
- 🎯 **Context-Aware** — Maintains working memory, pending tasks, and conversation history
- 🛡️ **Anti-Spam Guards** — Prevents repetitive actions (duplicate consolidations, repeated searches)
- 📝 **Session Logging** — Every run logged to separate file for behavior analysis

### Agent Tools

#### Communication
- `respond_to_user` — Send messages to the user
- `ask_user` — Ask questions and wait for answers (with context tracking)

#### File System
- `read_file` — Read file contents
- `write_file` — Write content to files

#### Web & Search
- `web_search` — Search the web using Serper API
- `fetch_url` — Fetch and parse web page content

#### Memory Management
- `write_engram` — Store episodic memories in vector database
- `search_engrams` — Search memories via semantic similarity
- `consolidate_thoughts` — Compact working memory

#### Task Scheduling
- `schedule_task` — Create recurring tasks with interval
- `list_scheduled_tasks` — View all scheduled tasks
- `cancel_scheduled_task` — Cancel a scheduled task

#### System
- `run_command` — Execute Windows terminal commands
- `wait` / `noop` — Intentionally wait for next tick

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+)
2. **Ollama** — Local LLM runtime
   ```bash
   # Install Ollama: https://ollama.ai
   ollama pull gemma4:e4b  # or your preferred model
   ```
3. **MongoDB** (optional, for episodic memory)
   ```bash
   # Using Docker:
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd aya-agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

### Configuration

Edit `.env`:

```bash
# Required
OLLAMA_MODEL=gemma4:e4b
OLLAMA_HOST=http://127.0.0.1:11434
TICK_INTERVAL=5000          # Heartbeat interval (ms)

# Optional
SERPER_API_KEY=your_key     # For web_search tool
MONGODB_URI=mongodb://...   # For episodic memory
MISSION=Your custom mission # Override default mission
```

### Run

```bash
# Start agent
npm start

# Development mode (auto-reload)
npm run dev
```

---

## 📱 Mobile App

React Native app for iOS/Android to interact with the agent remotely.

```bash
cd client-app
npm install
npm start

# Run on device
npm run android  # or npm run ios
```

**Features:**
- Real-time chat via Socket.IO
- Syncs conversation history
- Receives agent messages and questions

---

## 🏗️ Architecture

### Agent Loop

```
┌─────────────────────────────────────────┐
│  Heartbeat (every TICK_INTERVAL ms)    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Check Scheduled│
         │     Tasks      │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Gather Input  │
         │ (stdin/socket) │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   Call LLM     │
         │ (with context) │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Execute Tool  │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  Update State  │
         │  (persist DB)  │
         └────────────────┘
```

### State Management

```typescript
interface State {
  mission_progress: string;        // What's been accomplished
  working_memory: string;          // Key facts for next step
  pending: string;                 // Current task
  last_actions: string[];          // Recent 3 actions
  thought_history: string[];       // Recent 5 thoughts
  chat_history: Message[];         // Recent 10 messages
  awaiting_answer: Question | null;// Pending user answer
  scheduled_tasks: ScheduledTask[];// Recurring tasks
}
```

### Memory System

**Auto-RAG:** When user sends a message, agent automatically searches episodic memory for relevant context.

**Storage:**
- Conversations archived to MongoDB with vector embeddings
- Semantic search using Ollama's `nomic-embed-text` model
- Agent can explicitly store/search memories using tools

---

## 🎯 Usage Examples

### Basic Interaction

```
You: What's in notes.md?
Agent: [reads file] Here's the content: ...
```

### Scheduled Tasks

```
You: Give me news every 10 minutes
Agent: [uses schedule_task]
       Task scheduled! I'll fetch news every 10 minutes.

[10 minutes later]
Agent: [automatically] Here are the latest news: ...
```

### Question & Answer Flow

```
Agent: [uses ask_user] Which file should I read?
You: notes.md
Agent: [recognizes answer] Reading notes.md...
```

### Memory Usage

```
You: Remember that I prefer Python over JavaScript
Agent: [uses write_engram] Stored in memory!

[Later]
You: What language should I use?
Agent: [auto-RAG finds memory] Based on your preference, Python!
```

---

## 🛠️ Development

### Project Structure

```
aya-agent/
├── src/
│   ├── main.ts       # Agent loop & heartbeat
│   ├── types.ts      # TypeScript interfaces
│   ├── tools.ts      # Tool implementations
│   ├── prompts.ts    # System prompts
│   ├── memory.ts     # MongoDB + vector search
│   └── input.ts      # Console input handler
├── client-app/       # React Native mobile app
├── docs/             # Feature documentation
├── .env              # Configuration
└── package.json
```

### Adding New Tools

```typescript
// In src/tools.ts
export const tools: ToolRegistry = {
  // ... existing tools
  my_new_tool: {
    description: "What this tool does. Args: { param: type }",
    async execute(args): Promise<ToolResult> {
      const param = args.param as string;
      // Your logic here
      return { ok: true, data: { result: "..." } };
    },
  },
};
```

### Customizing Behavior

Edit `src/prompts.ts`:

```typescript
export const DEFAULT_DIRECTIVES = "Your custom directives...";
export const DEFAULT_MISSION = "Your custom mission...";
```

Or use environment variables:

```bash
DIRECTIVES="Be concise and technical"
MISSION="Monitor system logs and alert on errors"
```

---

## 📚 Documentation

- [Ask User Feature](docs/ask_user_feature.md) — Question/answer flow
- [Scheduled Tasks](docs/scheduled_tasks.md) — Recurring task system
- [Anti-Spam Guards](docs/anti_spam_guards.md) — Protection against repetitive behavior
- [Logging System](docs/logging.md) — Session logs for behavior analysis

---

## 🔧 Troubleshooting

### Agent loops/repeats responses

**Cause:** Pending state not cleared after `respond_to_user`  
**Fix:** Agent should set `pending_update: null` or `""` in response

### Agent spams consolidate_thoughts

**Cause:** Trying to consolidate with same/similar content repeatedly  
**Fix:** Anti-spam guards will block this. Agent should try different actions (web_search, read_file) or clear memory with empty string

### Agent repeats same web search

**Cause:** Same query used multiple times in recent actions  
**Fix:** Anti-spam guard blocks duplicate searches. Agent should try different queries or tools

### MongoDB connection fails

**Cause:** MongoDB not running or wrong URI  
**Fix:** Check `MONGODB_URI` in `.env`, start MongoDB, or disable by removing the variable

### LLM returns invalid JSON

**Cause:** Model hallucination or wrong temperature  
**Fix:** Try different model, adjust temperature in `callLLM()`, or add retry logic

### Scheduled tasks not triggering

**Cause:** `TICK_INTERVAL` too long or task not saved  
**Fix:** Reduce `TICK_INTERVAL`, check MongoDB for saved tasks

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Web dashboard for monitoring agent state
- [ ] More tools (email, calendar, notifications)
- [ ] Multi-agent coordination
- [ ] Better error recovery
- [ ] Task prioritization system

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built with:
- [Ollama](https://ollama.ai) — Local LLM runtime
- [MongoDB](https://mongodb.com) — Vector database
- [Socket.IO](https://socket.io) — Real-time communication
- [React Native](https://reactnative.dev) — Mobile app framework

---

**Made with ❤️ by the AYA team**
