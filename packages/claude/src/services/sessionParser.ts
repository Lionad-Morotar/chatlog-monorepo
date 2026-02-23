import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { JsonlEntry, SessionMessage, SessionSummary, ToolUse } from '../models';

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

export function getProjectKey(projectPath: string): string {
  const fullPath = path.resolve(projectPath);
  return fullPath.replace(/[\\/]/g, '-');
}

export function findProjectDir(projectPath?: string): string | null {
  if (projectPath) {
    const key = getProjectKey(projectPath);
    const dir = path.join(CLAUDE_PROJECTS_DIR, key);
    return fs.existsSync(dir) ? dir : null;
  }

  // Auto-detect: walk up from cwd looking for a match
  let candidate: string | null = process.cwd();
  while (candidate) {
    const key = getProjectKey(candidate);
    const dir = path.join(CLAUDE_PROJECTS_DIR, key);
    if (fs.existsSync(dir)) return dir;
    const parent = path.dirname(candidate);
    candidate = parent === candidate ? null : parent;
  }

  return null;
}

export function listAllProjectDirs(): string[] {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];

  return fs
    .readdirSync(CLAUDE_PROJECTS_DIR)
    .map(name => path.join(CLAUDE_PROJECTS_DIR, name))
    .filter(p => {
      try {
        return fs.statSync(p).isDirectory() && fs.readdirSync(p).some(f => f.endsWith('.jsonl'));
      } catch {
        return false;
      }
    });
}

export function listSessions(projectDir: string): SessionSummary[] {
  const sessions: SessionSummary[] = [];

  for (const file of fs.readdirSync(projectDir)) {
    if (!file.endsWith('.jsonl')) continue;
    const full = path.join(projectDir, file);
    const summary = parseSummary(full);
    if (summary) sessions.push(summary);
  }

  // Match legacy C# behavior: order by Created ascending
  return sessions.sort((a, b) => (a.created?.getTime() ?? 0) - (b.created?.getTime() ?? 0));
}

export function parseSummary(jsonlPath: string): SessionSummary | null {
  const sessionId = path.basename(jsonlPath, '.jsonl');
  const st = fs.statSync(jsonlPath);

  const summary: SessionSummary = {
    sessionId,
    fileSizeBytes: st.size,
    modified: st.mtime,
    projectPath: '',
    userMessageCount: 0,
    assistantMessageCount: 0,
    toolUseCount: 0
  };

  for (const line of readJsonlLines(jsonlPath)) {
    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line) as JsonlEntry;
      if (!entry) continue;

      if (entry.type === 'user') {
        summary.userMessageCount++;

        if (!summary.gitBranch && entry.gitBranch) summary.gitBranch = entry.gitBranch;

        if (!summary.created && entry.timestamp) summary.created = parseTimestamp(entry.timestamp);

        if (!summary.projectPath && entry.cwd) summary.projectPath = entry.cwd;

        if (!summary.firstPrompt && entry.message?.content != null) {
          summary.firstPrompt = extractText(entry.message.content) ?? undefined;
        }
      } else if (entry.message?.role === 'assistant') {
        summary.assistantMessageCount++;
        if (entry.message.content != null) {
          summary.toolUseCount += countToolUses(entry.message.content);
        }
      }
    } catch {
      // Skip malformed lines
    }
  }

  if (summary.userMessageCount === 0 && summary.assistantMessageCount === 0) return null;
  return summary;
}

export function parseMessages(jsonlPath: string, userOnly = false): SessionMessage[] {
  const messages: SessionMessage[] = [];

  for (const line of readJsonlLines(jsonlPath)) {
    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line) as JsonlEntry;
      if (!entry) continue;

      if (entry.type === 'user' && entry.message?.content != null) {
        const text = extractText(entry.message.content);
        if (text) {
          messages.push({
            role: 'user',
            content: text,
            timestamp: parseTimestamp(entry.timestamp),
            toolUses: []
          });
        }
      } else if (!userOnly && entry.message?.role === 'assistant' && entry.message.content != null) {
        const text = extractText(entry.message.content) ?? '';
        const toolUses = extractToolUses(entry.message.content);

        if (text || toolUses.length > 0) {
          messages.push({
            role: 'assistant',
            content: text,
            model: entry.message.model,
            timestamp: parseTimestamp(entry.timestamp),
            toolUses
          });
        }
      }
    } catch {
      // Skip malformed lines
    }
  }

  return messages;
}

export function searchMessages(jsonlPath: string, query: string): SessionMessage[] {
  const results: SessionMessage[] = [];

  for (const line of readJsonlLines(jsonlPath)) {
    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line) as JsonlEntry;
      if (!entry?.message?.content) continue;

      const text = extractText(entry.message.content);
      if (text && text.toLowerCase().includes(query.toLowerCase())) {
        const role = entry.type === 'user' ? 'user' : entry.message.role ?? 'unknown';
        results.push({
          role,
          content: text,
          timestamp: parseTimestamp(entry.timestamp),
          toolUses: []
        });
      }
    } catch {
      // Skip malformed lines
    }
  }

  return results;
}

function* readJsonlLines(jsonlPath: string): Generator<string> {
  const data = fs.readFileSync(jsonlPath, 'utf8');
  const lines = data.split(/\r?\n/);
  for (const line of lines) yield line;
}

function extractText(content: unknown): string | null {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const item of content) {
      if (
        item &&
        typeof item === 'object' &&
        (item as any).type === 'text' &&
        typeof (item as any).text === 'string'
      ) {
        const t = (item as any).text as string;
        if (t) texts.push(t);
      }
    }
    return texts.length > 0 ? texts.join('\n') : null;
  }

  if (content && typeof content === 'object') return JSON.stringify(content);
  return content == null ? null : String(content);
}

function countToolUses(content: unknown): number {
  if (Array.isArray(content)) {
    let count = 0;
    for (const item of content) {
      if (item && typeof item === 'object' && (item as any).type === 'tool_use') count++;
    }
    return count;
  }
  return 0;
}

function extractToolUses(content: unknown): ToolUse[] {
  const toolUses: ToolUse[] = [];

  if (Array.isArray(content)) {
    for (const item of content) {
      if (
        item &&
        typeof item === 'object' &&
        (item as any).type === 'tool_use' &&
        typeof (item as any).name === 'string'
      ) {
        toolUses.push({
          name: (item as any).name || 'unknown'
        });
      }
    }
  }

  return toolUses;
}

function parseTimestamp(timestamp: string | undefined): Date | undefined {
  if (!timestamp) return undefined;
  const d = new Date(timestamp);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
