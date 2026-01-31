# Promption

![Promption Banner](public/promption.png)

[![Release](https://img.shields.io/github/v/release/Abdssamie/promption?style=flat-square)](https://github.com/Abdssamie/promption/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Abdssamie/promption/release.yml?style=flat-square)](https://github.com/Abdssamie/promption/actions)
[![License](https://img.shields.io/github/license/Abdssamie/promption?style=flat-square)](LICENSE)

A desktop app + CLI for managing AI context: Skills, Rules, Workflows, and Agents. Stop copy-pasting `.cursorrules`.

## The Problem

AI coding assistants (Cursor, Windsurf, OpenCode, etc.) use configuration files to guide their behavior. Managing these across multiple projects is painful:
- ❌ Manually copying configuration folders between projects
- ❌ Losing track of which configs work with which tech stacks
- ❌ No easy way to organize or search through your prompt library
- ❌ Difficult to share configurations with team members
- ❌ Creating agent configs manually in JSON files

## The Solution

**Promption** is your centralized library for AI context.

![Desktop App Screenshot](public/promption-desktop-screenshot.png)

### What You Can Manage

- **📝 Skills** - Reusable prompt templates (e.g., "Explain Code", "Write Tests", "Debug Issue")
- **📋 Rules** - Coding standards & best practices (TypeScript conventions, React patterns, Python style guides)
- **🔄 Workflows** - Multi-step processes (refactoring flows, debugging patterns, review checklists)
- **🤖 Agents** - OpenCode agent configurations (primary agents, subagents with tools & permissions)

### Desktop App
- **Centralized Library**: Store all your AI context in one place.
- **Smart Organization**: Tag by technology (React, Python, Rust, etc.).
- **Full-Text Search**: Find the right prompt instantly.
- **Visual Management**: Create and edit agents with a rich GUI.
- **Privacy First**: All data stored locally in SQLite. No cloud, no tracking.

### CLI
Sync your configurations to any project with a single command.

![CLI Screenshot](public/cli-screenshot.png)

```bash
# List your saved items
promption list [--type skill|rule|workflow]

# Sync items to your project (supports Cursor, Windsurf, OpenCode, etc.)
promption sync --ids=abc123,def456 --target=cursor

# Manage agents
promption list-agents
promption create-agent --name code-reviewer \
  --mode subagent \
  --model anthropic/claude-sonnet-4 \
  --tools read,grep,search \
  --permissions edit:deny,bash:deny

# Sync agents to opencode.json
promption sync-agents --ids=agent-id
```

## Supported Tools

| Tool | Support | Output Location |
|------|---------|-----------------|
| **Antigravity** | ✅ | `.agent/` |
| **Cursor** | ✅ | `.cursor/rules/` & `.cursorrules` |
| **Windsurf** | ✅ | `.windsurf/rules/` & `.windsurf/skills/` |
| **OpenCode** | ✅ | `.opencode/rules/` & `.opencode/skills/` |
| **Cline** | ✅ | `.clinerules/` & `.cline/skills/` |
| **GitHub Copilot** | ✅ | `.github/copilot-instructions.md` |

## Installation

### Pre-built Binaries (Recommended)
Download the latest version for macOS, Linux, and Windows from [Releases](https://github.com/Abdssamie/promption/releases).

### Build from Source

```bash
git clone https://github.com/Abdssamie/promption.git
cd promption
bun install
bun run tauri build
```

**Requirements:** [Rust](https://rustup.rs/), [Node.js](https://nodejs.org/), [Bun](https://bun.sh/).

## Usage

### Desktop App
1. **Launch Promption** and add your Skills, Rules, Workflows, and Agents.
2. **Tag them** by technology for easier filtering (React, Python, TypeScript, etc.).
3. **Select items** you want to use in your current project.
4. **Click "Copy Cmd"** or run `promption list` to get IDs.
5. **Run the sync command** in your project root:
   ```bash
   promption sync --ids=... --target=windsurf
   ```

### CLI Examples

**Managing Items:**
```bash
# List all items
promption list

# List by type
promption list --type rule

# Sync to different tools
promption sync --ids=abc,def --target=cursor
promption sync --ids=abc,def --target=opencode
```

**Managing Agents:**
```bash
# Create an agent
promption create-agent \
  --name python-expert \
  --mode primary \
  --model gpt-4 \
  --prompt "You are a Python expert" \
  --tools read,write,search

# Create from file
promption create-agent \
  --name reviewer \
  --prompt ./prompts/reviewer.txt \
  --prompt-file \
  --tools read,grep

# Update an agent
promption update-agent --id agent-id --model gpt-4-turbo

# Get agent details (JSON for scripting)
promption get-agent --id agent-name --format json

# Delete an agent
promption delete-agent --id agent-id
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New skill |
| `Ctrl+Shift+S/R/W` | New skill/rule/workflow |
| `Ctrl+F` | Focus search |
| `Ctrl+C` | Copy sync command |

## Tech Stack

- **Core**: Tauri v2, Rust
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, Shadcn/UI
- **Database**: SQLite

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions.

## License

[MIT](LICENSE)
