import fs from 'node:fs';
import path from 'node:path';
import type { SessionSummary } from '../models';
import { createFormatter, OutputFormat } from '../output';
import {
  findProjectDir,
  listAllProjectDirs,
  listSessions,
  parseMessages,
  parseSummary,
  searchMessages
} from '../services/sessionParser';

export interface CommandOptions {
  command: string;
  subCommand: string;
  positional?: string;
  query?: string;
  format: OutputFormat;
  path?: string;
}

export function route(args: string[]): number {
  const opts = parseOptions(args);

  switch (`${opts.command}:${opts.subCommand}`) {
    case 'sessions:list':
    case 'sessions:':
      return sessionsList(opts);
    case 'sessions:show':
      return sessionsShow(opts);
    case 'sessions:messages':
      return sessionsMessages(opts);
    case 'sessions:prompts':
      return sessionsPrompts(opts);
    case 'sessions:search':
      return sessionsSearch(opts);
    case 'sessions:tools':
      return sessionsTools(opts);
    case 'projects:list':
    case 'projects:':
      return projectsList(opts);
    default:
      return showError(`Unknown command: ${opts.command} ${opts.subCommand}`);
  }
}

function sessionsList(opts: CommandOptions): number {
  const projectDir = findProjectDir(opts.path);
  if (!projectDir)
    return showError('No Claude Code sessions found. Use --path to specify a project directory.');

  const sessions = listSessions(projectDir);
  const formatter = createFormatter(opts.format);
  formatter.writeSessions(sessions);
  return 0;
}

function sessionsShow(opts: CommandOptions): number {
  const resolved = resolveSession(opts);
  if (!resolved.path) return showError(resolved.error!);

  const summary = parseSummary(resolved.path);
  const formatter = createFormatter(opts.format);
  formatter.writeSession(summary);
  return 0;
}

function sessionsMessages(opts: CommandOptions): number {
  const resolved = resolveSession(opts);
  if (!resolved.path) return showError(resolved.error!);

  const messages = parseMessages(resolved.path);
  const formatter = createFormatter(opts.format);
  formatter.writeMessages(messages);
  return 0;
}

function sessionsPrompts(opts: CommandOptions): number {
  const resolved = resolveSession(opts);
  if (!resolved.path) return showError(resolved.error!);

  const messages = parseMessages(resolved.path, true);
  const formatter = createFormatter(opts.format);
  formatter.writeMessages(messages);
  return 0;
}

function sessionsSearch(opts: CommandOptions): number {
  if (!opts.query) return showError('Usage: chatlog sessions search <query> [--path <project-path>]');

  const projectDir = findProjectDir(opts.path);
  if (!projectDir)
    return showError('No Claude Code sessions found. Use --path to specify a project directory.');

  const sessions = listSessions(projectDir);
  const formatter = createFormatter(opts.format);
  let totalMatches = 0;

  for (const session of sessions) {
    const jsonlPath = path.join(projectDir, session.sessionId + '.jsonl');
    const matches = searchMessages(jsonlPath, opts.query);
    if (matches.length > 0) {
      // Match C# behavior: always print this header (even in json mode)
      // eslint-disable-next-line no-console
      console.log(
        `\x1b[1m--- Session: ${session.sessionId} (${session.gitBranch ?? 'no branch'}, ${formatDateOnly(session.created)}) ---\x1b[0m`
      );
      formatter.writeMessages(matches, session.sessionId);
      totalMatches += matches.length;
    }
  }

  if (totalMatches === 0) {
    // eslint-disable-next-line no-console
    console.log(`No matches for "${opts.query}".`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`\n${totalMatches} total matches across sessions.`);
  }

  return 0;
}

function sessionsTools(opts: CommandOptions): number {
  const projectDir = findProjectDir(opts.path);
  if (!projectDir)
    return showError('No Claude Code sessions found. Use --path to specify a project directory.');

  let sessions = listSessions(projectDir);

  if (opts.positional) {
    const match = resolveSessionId(opts.positional, sessions);
    if (!match) return showError(`Session not found: ${opts.positional}`);
    sessions = [match];
  }

  const toolCounts = new Map<string, number>();

  for (const session of sessions) {
    const jsonlPath = path.join(projectDir, session.sessionId + '.jsonl');
    const messages = parseMessages(jsonlPath);
    for (const msg of messages) {
      for (const tool of msg.toolUses) {
        toolCounts.set(tool.name, (toolCounts.get(tool.name) ?? 0) + 1);
      }
    }
  }

  if (toolCounts.size === 0) {
    // eslint-disable-next-line no-console
    console.log('No tool usage found.');
    return 0;
  }

  // eslint-disable-next-line no-console
  console.log(`${'Tool'.padEnd(30)} ${'Count'.padEnd(8)}`);
  // eslint-disable-next-line no-console
  console.log('-'.repeat(38));

  const sorted = [...toolCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [tool, count] of sorted) {
    // eslint-disable-next-line no-console
    console.log(`${tool.padEnd(30)} ${String(count).padEnd(8)}`);
  }

  const total = sorted.reduce((sum, [, c]) => sum + c, 0);
  // eslint-disable-next-line no-console
  console.log(`\n${total} total tool uses across ${sessions.length} session(s)`);
  return 0;
}

function projectsList(_opts: CommandOptions): number {
  const dirs = listAllProjectDirs();
  if (dirs.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No Claude Code projects found.');
    return 0;
  }

  // eslint-disable-next-line no-console
  console.log(`${'Project Key'.padEnd(60)} ${'Sessions'.padEnd(10)}`);
  // eslint-disable-next-line no-console
  console.log('-'.repeat(70));

  for (const dir of dirs.sort()) {
    const name = path.basename(dir);
    let sessionCount = 0;
    try {
      sessionCount = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')).length;
    } catch {
      sessionCount = 0;
    }
    // eslint-disable-next-line no-console
    console.log(`${name.padEnd(60)} ${String(sessionCount).padEnd(10)}`);
  }

  return 0;
}

function resolveSession(opts: CommandOptions): { path: string | null; error?: string } {
  const projectDir = findProjectDir(opts.path);
  if (!projectDir)
    return {
      path: null,
      error: 'No Claude Code sessions found. Use --path to specify a project directory.'
    };

  if (!opts.positional) {
    return {
      path: null,
      error: `Usage: chatlog sessions ${opts.subCommand} <session-id-or-number> [--path <project-path>]`
    };
  }

  const sessions = listSessions(projectDir);
  const match = resolveSessionId(opts.positional, sessions);
  if (!match) {
    return {
      path: null,
      error: `Session not found: ${opts.positional}. Use 'chatlog sessions list' to see available sessions.`
    };
  }

  return { path: path.join(projectDir, match.sessionId + '.jsonl') };
}

function resolveSessionId(input: string, sessions: SessionSummary[]): SessionSummary | undefined {
  const idx = Number.parseInt(input, 10);
  if (!Number.isNaN(idx) && idx >= 1 && idx <= sessions.length) return sessions[idx - 1];

  const lower = input.toLowerCase();
  const matches = sessions.filter(s => s.sessionId.toLowerCase().startsWith(lower));
  if (matches.length === 1) return matches[0];

  return sessions.find(s => s.sessionId.toLowerCase() === lower);
}

function showError(message: string): number {
  // eslint-disable-next-line no-console
  console.error(message);
  return 1;
}

function parseOptions(args: string[]): CommandOptions {
  const opts: CommandOptions = {
    command: '',
    subCommand: '',
    format: OutputFormat.Table
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const value = i + 1 < args.length ? args[i + 1] : undefined;
      switch (arg) {
        case '--format':
          opts.format = value?.toLowerCase() === 'json' ? OutputFormat.Json : OutputFormat.Table;
          i++;
          break;
        case '--path':
          opts.path = value;
          i++;
          break;
      }
    } else if (!opts.command) {
      opts.command = arg;
    } else if (!opts.subCommand) {
      opts.subCommand = arg;
    } else if (!opts.positional) {
      opts.positional = arg;
    } else if (!opts.query) {
      // For search, the positional becomes the query
      opts.query = opts.positional;
      opts.positional = arg;
    }
  }

  if (opts.subCommand === 'search' && !opts.query && opts.positional) {
    opts.query = opts.positional;
    opts.positional = undefined;
  }

  return opts;
}

function formatDateOnly(d: Date | undefined): string {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
