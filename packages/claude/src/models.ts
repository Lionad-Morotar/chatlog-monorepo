export interface SessionSummary {
  sessionId: string;
  gitBranch?: string;
  firstPrompt?: string;
  created?: Date;
  modified?: Date;
  userMessageCount: number;
  assistantMessageCount: number;
  toolUseCount: number;
  fileSizeBytes: number;
  projectPath: string;
}

export interface ToolUse {
  name: string;
  input?: unknown;
}

export interface SessionMessage {
  role: string;
  content: string;
  timestamp?: Date;
  model?: string;
  toolUses: ToolUse[];
}

// Raw JSONL line types (best-effort; fields vary by Claude Code versions)
export interface JsonlEntry {
  type?: string;
  role?: string;
  parentUuid?: string;
  isSidechain?: boolean;
  uuid?: string;
  sessionId?: string;
  gitBranch?: string;
  timestamp?: string;
  cwd?: string;
  message?: JsonlMessage;
}

export interface JsonlMessage {
  role?: string;
  content?: unknown;
  model?: string;
}
