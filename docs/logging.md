# Logging System

## Overview
Every agent run creates a separate log file with timestamp, allowing you to analyze agent behavior later.

## Log Files

### Location
```
logs/
├── run_2026-04-18T10-30-45-123Z.log
├── run_2026-04-18T11-15-22-456Z.log
└── run_2026-04-18T12-00-00-789Z.log
```

### Naming Convention
```
run_<ISO_TIMESTAMP>.log
```
- ISO 8601 format with colons and dots replaced by dashes
- Example: `run_2026-04-18T10-30-45-123Z.log`

### Content
Each log file contains:
- All console output (ticks, thoughts, actions, results)
- Timestamps for every line
- ANSI color codes stripped for readability
- User input and agent responses
- Errors and warnings
- System events (startup, shutdown, scheduled tasks)

## Implementation

### Automatic Logging
```typescript
// Every console.log is automatically captured
console.log("Hello") 
// → Console: colored output
// → File: [2026-04-18T10:30:45.123Z] Hello
```

### Log Stream
- Created at agent startup
- Writes to `logs/run_<timestamp>.log`
- Automatically closed on exit (Ctrl+C or 'exit' command)
- Buffered writes for performance

### Startup Message
```
══════════════════════════════════════════════════════════
  A Y A   A G E N T  v0.1.0
══════════════════════════════════════════════════════════
● System Online
⚙ Model: gemma4:e4b
⏱ Interval: 5000ms
📝 Log: run_2026-04-18T10-30-45-123Z.log
  Interactive mode enabled. Type queries or 'exit' to quit.
══════════════════════════════════════════════════════════
```

### Shutdown Message
```
👋 Goodbye.
📝 Session log saved to: logs/run_2026-04-18T10-30-45-123Z.log
```

## Usage

### Analyzing Behavior
```bash
# View latest run
cat logs/run_*.log | tail -n 100

# Search for errors
grep "fail:" logs/run_*.log

# Count ticks in a run
grep "Tick" logs/run_2026-04-18T10-30-45-123Z.log | wc -l

# Find all web searches
grep "web_search" logs/run_*.log

# View specific run
less logs/run_2026-04-18T10-30-45-123Z.log
```

### Log Rotation
Logs are NOT automatically rotated. To manage disk space:

```bash
# Delete logs older than 7 days
find logs/ -name "run_*.log" -mtime +7 -delete

# Keep only last 10 runs
ls -t logs/run_*.log | tail -n +11 | xargs rm

# Compress old logs
gzip logs/run_2026-04-*.log
```

## Example Log Entry

```
[2026-04-18T10:30:45.123Z] 
[2026-04-18T10:30:45.124Z] ╭── Tick 1 ⚙️ ──────────────────────────────────────
[2026-04-18T10:30:45.125Z]   📩 Buffered (Console): "hello"
[2026-04-18T10:30:45.500Z] │ 💭 Thought: User greeted me, I should respond warmly
[2026-04-18T10:30:45.501Z] │ 🔧 Action:  respond_to_user( [hidden payload] )
[2026-04-18T10:30:45.502Z] 
[2026-04-18T10:30:45.503Z] ╭──────────────────────────────────────────────────
[2026-04-18T10:30:45.504Z] │ 🤖 AYA: Hello! How can I help you today?
[2026-04-18T10:30:45.505Z] ╰──────────────────────────────────────────────────
[2026-04-18T10:30:45.506Z] │ ✓ Result:   {"delivered":true}
[2026-04-18T10:30:45.507Z] ╰──────────────────────────────────────────────────
```

## Benefits

✅ **Debugging** — Trace agent behavior step by step  
✅ **Analysis** — Identify patterns, loops, and inefficiencies  
✅ **Auditing** — Review what agent did during a session  
✅ **Research** — Study agent decision-making over time  
✅ **Comparison** — Compare behavior before/after prompt changes  

## Configuration

### Disable Logging
Set environment variable:
```bash
NO_LOGGING=true npm start
```

### Custom Log Directory
```bash
LOGS_DIR=/path/to/logs npm start
```

### Log Level (Future)
Currently logs everything. Future versions may support:
- `LOG_LEVEL=debug` — All output
- `LOG_LEVEL=info` — Ticks and actions only
- `LOG_LEVEL=error` — Errors only

## Notes

- Logs directory is created automatically if it doesn't exist
- Logs are excluded from git (in `.gitignore`)
- Each run is independent — no log file conflicts
- ANSI color codes are stripped for clean file output
- Console still shows colored output for readability
- Log files are UTF-8 encoded
- Timestamps are in UTC (ISO 8601 format)

## Troubleshooting

### Logs directory not created
**Cause**: Permission issues  
**Fix**: Manually create `logs/` directory with write permissions

### Log file empty
**Cause**: Agent crashed before writing  
**Fix**: Check for errors in console, ensure `logStream.end()` is called

### Huge log files
**Cause**: Long-running sessions with verbose output  
**Fix**: Implement log rotation or reduce `TICK_INTERVAL`

### Missing timestamps
**Cause**: Custom console.log override not working  
**Fix**: Use original `console.log` or check override implementation
