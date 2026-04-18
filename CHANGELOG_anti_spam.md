# Anti-Spam Guards Implementation

## Date: 2026-04-18

## Problem
Agent was spamming `consolidate_thoughts` with identical or very similar content, causing repetitive behavior:
- Tick 8-9: Identical consolidations
- Tick 7-9: Growing text with minimal changes
- Tick 21-22: Repeated web_search queries
- Tick 25: Rewrote files with nearly identical content

## Solution

### 1. Enhanced Guards in `src/main.ts`

Added three protection mechanisms in `runPlannedAction()`:

#### A. Failed Action Guard (existing, kept)
- Prevents repeating exact same failed action
- Checks if last action in history matches current action and failed

#### B. Consolidate Thoughts Guard (enhanced)
- **Exact match check**: Blocks if `new_working_memory === current working_memory`
- **Similarity check**: Blocks if new memory is >90% similar to current memory
- Uses Jaccard similarity algorithm on word sets
- Provides helpful error messages suggesting alternatives

#### C. Web Search Guard (new)
- Prevents repeating same search query within last 3 actions
- Case-insensitive comparison
- Suggests trying different queries or tools

### 2. Improved Prompts in `src/prompts.ts`

Updated `WHEN IDLE` section with clearer guidance:
- First idle tick: consolidate thoughts
- Second idle tick: clear memory with empty string
- Third+ idle tick: do something productive (web_search, read_file)
- Explicit warning: "NEVER consolidate with the same or very similar content"
- Added: "Don't repeat the same web_search query"

### 3. Helper Function

Added `calculateSimilarity()` function:
```typescript
function calculateSimilarity(str1: string, str2: string): number {
  // Jaccard similarity: |A ∩ B| / |A ∪ B|
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
```

### 4. Documentation

Created comprehensive documentation:
- `docs/anti_spam_guards.md` — Detailed guard documentation
- Updated `README.md` — Added anti-spam feature to core capabilities
- Added troubleshooting section for spam-related issues

## Files Changed

1. `src/main.ts`
   - Enhanced `runPlannedAction()` with 3 guards
   - Added `calculateSimilarity()` helper function

2. `src/prompts.ts`
   - Updated `WHEN IDLE` section with progressive idle behavior
   - Added explicit warnings about repetition

3. `docs/anti_spam_guards.md` (new)
   - Complete guard documentation
   - Testing scenarios
   - Future improvement ideas

4. `README.md`
   - Added anti-spam to core features
   - Added troubleshooting entries
   - Added link to anti-spam docs

5. `CHANGELOG_anti_spam.md` (this file)

## Testing Recommendations

Test these scenarios:
1. ✅ Agent tries to consolidate with exact same content → Blocked
2. ✅ Agent tries to consolidate with 95% similar content → Blocked
3. ✅ Agent searches "AI agents" twice in 3 ticks → Second blocked
4. ✅ Agent consolidates → clears memory → searches web → All allowed
5. ✅ Agent fails action → tries same action → Blocked

## Future Improvements

Potential enhancements identified:
1. File write guard (detect nearly identical file writes)
2. Action pattern detection (A→B→A→B cycles)
3. Configurable similarity threshold (currently hardcoded 90%)
4. Time-based guards (allow same action after N minutes)
5. Smart consolidation suggestions (when it's actually needed)

## Impact

Expected behavior improvements:
- ✅ No more spam consolidations
- ✅ No more repeated searches
- ✅ More diverse agent actions when idle
- ✅ Better user experience (less noise)
- ✅ More productive agent behavior
- ✅ Agent reacts to errors instead of ignoring them
- ✅ Agent blocks when waiting for user answer (no parallel work)

## Additional Changes (2026-04-18 Update)

### Error Awareness
- Added principle #4: "If your last action FAILED - analyze the error and fix it (don't ignore errors!)"
- Added principle #9: "If stuck after 2 failed attempts - try fundamentally different approach or ask_user for help"
- Added warning when ≥2 consecutive failures detected (soft warning, not blocking)
- Warning skipped if agent is already using `ask_user`

### Ask User Blocking
- **BREAKING CHANGE**: `ask_user` now blocks all ticks until user responds
- Added check: `if (state.awaiting_answer && !hasInput) return;`
- Prevents agent from doing other work while waiting for answer
- Prevents agent from asking multiple questions without waiting
- Updated `docs/ask_user_feature.md` with blocking behavior documentation

## Notes

- Guards return `ToolResult` with `ok: false` and descriptive error messages
- LLM sees the error and must choose different action
- Similarity threshold (90%) may need tuning based on real usage
- Guards are defensive but not restrictive (allow legitimate repetition after clearing/changing)
