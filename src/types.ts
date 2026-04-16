// ── Types ──────────────────────────────────────────────

export interface Goal {
  description: string;
  check: GoalCheck;
}

export interface State {
  goal_progress: string;
  working_memory: string;
  pending: string;
  last_actions: string[];
  thought_history: string[];
  chat_history: { role: string; content: string }[];
}

export interface ToolResult {
  ok: boolean;
  data: unknown;
  error?: string;
}

export interface LLMOutput {
  thought: string;
  action: {
    tool: string;
    args: Record<string, unknown>;
  };
  memory_update: string;
  pending_update: string | null;
}

export type GoalCheck = (state: State, result: ToolResult | null) => boolean;

export interface ToolDef {
  description: string;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export type ToolRegistry = Record<string, ToolDef>;
