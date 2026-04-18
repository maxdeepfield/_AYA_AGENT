# Anti-Spam Guards

## Overview
The agent has built-in guards to prevent repetitive and spammy behavior. These guards are implemented in `src/main.ts` in the `runPlannedAction()` function.

## Guard Types

### 1. Failed Action Guard
**Purpose**: Prevent repeating the exact same action that just failed.

**Behavior**: If the last action in `state.last_actions` is the same tool call with same arguments and it failed, the guard blocks it.

**Error Message**: `"SYSTEM GUARD: You repeated the exact same failed action. Try a different approach."`

### 2. Consecutive Failures Warning
**Purpose**: Alert agent when multiple actions are failing in a row.

**Behavior**: 
- Counts failures in last 3 actions
- If ≥2 failures detected, shows warning (but allows the action)
- Skips warning if agent is using `ask_user` (already seeking help)

**Warning Message**: `"⚠️  WARNING: N recent failures. Consider asking user for help or trying different approach."`

**Note**: This is a soft warning, not a hard block. Agent sees it and should react accordingly.

### 3. Shallow Research Warning
**Purpose**: Alert agent when doing multiple web searches without reading full content.

**Behavior**:
- Checks if agent did `web_search` in last 5 actions
- Checks if agent did `fetch_url` in last 5 actions
- If multiple searches but no fetches, shows warning

**Warning Message**: `"⚠️  WARNING: Multiple web_search without fetch_url. Snippets are too short - fetch full content!"`

**Note**: Soft warning. Encourages proper research workflow: search → fetch → read.

### 4. Research Spam Warning
**Purpose**: Alert agent when doing too many consecutive research actions without user interaction.

**Behavior**:
- Counts `web_search`, `fetch_url`, `write_engram` in last 3 actions
- If ≥2 research actions and next action is also research (not respond/consolidate), shows warning
- Encourages agent to report findings or consolidate before continuing

**Warning Message**: `"⚠️  WARNING: N consecutive research actions. Consider consolidating or reporting to user."`

**Note**: Prevents research spam loops. Agent should periodically report to user or consolidate thoughts.

### 5. Consolidate Thoughts Guard
**Purpose**: Prevent repeating the exact same action that just failed.

**Behavior**: If the last action in `state.last_actions` is the same tool call with same arguments and it failed, the guard blocks it.

**Error Message**: `"SYSTEM GUARD: You repeated the exact same failed action. Try a different approach."`

### 3. Consolidate Thoughts Guard
**Purpose**: Prevent spamming `consolidate_thoughts` with identical or very similar content.

**Behavior**:
- **Exact match**: If `new_working_memory` is exactly the same as current `working_memory`, blocked
- **Similarity check**: If new memory is >90% similar to current memory (using Jaccard similarity on words), blocked

**Error Messages**:
- Exact: `"SYSTEM GUARD: You're trying to consolidate with the exact same content. Memory is already consolidated. Try clearing it with empty string or do something else."`
- Similar: `"SYSTEM GUARD: New memory is X% similar to current memory. Don't spam consolidation. Try a different action or clear memory with empty string."`

**Similarity Algorithm**: Jaccard similarity on word sets
```
similarity = |words1 ∩ words2| / |words1 ∪ words2|
```

### 5. Web Search Guard
**Purpose**: Prevent repeating the same web search query within recent actions.

**Behavior**: Checks last 3 actions for `web_search` calls. If the same query (case-insensitive) was already used, blocks it.

**Error Message**: `"SYSTEM GUARD: You already searched for "query" recently. Try a different query or use a different tool."`

## Prompt Instructions

The system prompt includes guidance for idle behavior:

```
WHEN IDLE (no pending task):
- If working_memory is long (>200 chars) AND you haven't consolidated recently - use consolidate_thoughts to compact it
- If you haven't greeted the user recently - use respond_to_user to say you're ready
- If you already responded and user hasn't replied:
  * First time: use consolidate_thoughts to organize your thoughts
  * Second time: use consolidate_thoughts with empty string to clear memory
  * Third+ time: DON'T consolidate again - instead use web_search to learn something new, or read_file to explore the project
- NEVER consolidate with the same or very similar content - the system will reject it
- Don't repeatedly check scheduled tasks - they trigger automatically
- Don't repeat the same web_search query - try different queries or tools
```

## Implementation Details

### Location
- **File**: `src/main.ts`
- **Function**: `runPlannedAction(state: State, output: LLMOutput): Promise<ToolResult>`

### Helper Function
```typescript
function calculateSimilarity(str1: string, str2: string): number
```
Calculates Jaccard similarity between two strings based on word sets.

## Testing Scenarios

### Scenario 1: Repeated Consolidation
```
Tick 1: consolidate_thoughts("User greeted me")
Tick 2: consolidate_thoughts("User greeted me") ❌ BLOCKED
```

### Scenario 2: Similar Consolidation
```
Tick 1: consolidate_thoughts("User greeted me and I responded")
Tick 2: consolidate_thoughts("User greeted me and I said hello") ❌ BLOCKED (>90% similar)
```

### Scenario 3: Repeated Search
```
Tick 1: web_search("self-evolving AI agents")
Tick 2: web_search("self-evolving AI agents") ❌ BLOCKED
```

### Scenario 4: Multiple Failures
```
Tick 1: run_command("invalid_cmd") → fail
Tick 2: run_command("another_bad_cmd") → fail
Tick 3: web_search("...") ⚠️ WARNING shown (2 failures detected)
```

### Scenario 5: Valid Progression
```
Tick 1: consolidate_thoughts("User greeted me")
Tick 2: consolidate_thoughts("") ✅ ALLOWED (clearing memory)
Tick 3: web_search("AI research") ✅ ALLOWED (different action)
```

### Scenario 6: Error Recovery
```
Tick 1: run_command("bad_cmd") → fail
Tick 2: ask_user("The command failed. What should I do?") ✅ ALLOWED (seeking help)
```

### Scenario 7: Shallow Research
```
Tick 1: web_search("AI agents") → ok (gets snippets)
Tick 2: web_search("self-evolving AI") → ok (gets snippets)
Tick 3: web_search("autonomous agents") ⚠️ WARNING (multiple searches, no fetch)
```

### Scenario 8: Proper Research
```
Tick 1: web_search("AI agents") → ok (gets links)
Tick 2: fetch_url("https://example.com/article") → ok (reads full content)
Tick 3: web_search("another topic") ✅ ALLOWED (proper workflow)
```

## Future Improvements

Potential enhancements:
1. **File write guard**: Detect when writing nearly identical content to a file
2. **Action pattern detection**: Identify longer repetitive patterns (A→B→A→B)
3. **Configurable thresholds**: Make similarity threshold (90%) configurable
4. **Time-based guards**: Allow same action after N minutes
5. **Smart consolidation**: Suggest when consolidation is actually needed vs when to do something else
