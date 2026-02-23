# chatlog (Claude)

A quick-and-dirty CLI tool for browsing and searching your local [Claude Code](https://docs.anthropic.com/en/docs/claude-code) chat logs. Read more about how this tool fits into a self-improving CLAUDE.md workflow on [my blog](https://martinalderson.com/posts/self-improving-claude-md-files/).

This repo is now NodeJS-first (TypeScript). The legacy C#/.NET implementation is preserved under `refs/claude-log-cli`.

## Usage

```
chatlog sessions list                 # List all sessions for the current project
chatlog sessions show <id|#index>     # Show session details
chatlog sessions messages <id|#index> # Show all messages in a session
chatlog sessions prompts <id|#index>  # Show only your prompts
chatlog sessions search <query>       # Search across all sessions
chatlog sessions tools [<id|#index>]  # Show tool usage stats
chatlog projects list                 # List all Claude Code projects
```

Sessions can be referenced by UUID, UUID prefix, or `#index` (1-based; order follows `sessions list`).

### Options

```
--format json    Output as JSON instead of a table
--path <dir>     Override the project directory
--help           Show help
```

## Development

```sh
pnpm install
pnpm run build

# run in TS (dev)
pnpm -w --filter @lionad/chatlog-claude run dev -- sessions list

# run built JS
node packages/claude/dist/cli.js sessions list
```
