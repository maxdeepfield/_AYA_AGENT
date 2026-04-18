export interface State {
  mission_progress: string;
  working_memory: string;
  pending: string;
  last_actions: string[];
  thought_history: string[];
  chat_history: { role: string; content: string }[];
  awaiting_answer: { question: string; asked_at: number } | null;
  scheduled_tasks: ScheduledTask[];
}

export interface ScheduledTask {
  id: string;
  task: string;
  interval_minutes: number;
  last_executed: number;
  next_execution: number;
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
  pending_update: string | null;
}

export interface ToolDef {
  description: string;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export type ToolRegistry = Record<string, ToolDef>;
