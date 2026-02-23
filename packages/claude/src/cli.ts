#!/usr/bin/env node

import { route } from './commands/commandRouter';

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`chatlog - Parse and analyze Claude Code chat logs

Usage: chatlog <command> [options]

Commands:
  sessions list                             List all sessions for current project
  sessions show <id|#>                      Show session details
  sessions messages <id|#>                  Show all messages in a session
  sessions prompts <id|#>                   Show only user prompts from a session
  sessions search <query>                   Search across all sessions
  sessions tools [<id|#>]                   Show tool usage stats

  projects list                             List all Claude Code projects

Session Identifier:
  Sessions can be referenced by their full UUID, a UUID prefix,
  or by their 1-based index number from 'sessions list'.

Options:
  --path <project-path>                     Project path (default: auto-detect from cwd)
  --format <table|json>                     Output format (default: table)
  --help                                    Show this help

Examples:
  chatlog sessions list
  chatlog sessions list --path /Users/me/my-project
  chatlog sessions prompts 3
  chatlog sessions search "docker"
  chatlog sessions tools
  chatlog sessions messages 1 --format json
  chatlog projects list
`);
}

const args = process.argv.slice(2);

// Support `--help` / `-h` anywhere in the args (e.g. `chatlog sessions list --help`).
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

try {
  const code = route(args);
  process.exit(code);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error(`Error: ${msg}`);
  process.exit(1);
}
