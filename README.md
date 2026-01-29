# Promption

A desktop app + CLI for managing AI agent configurations across projects.

## The Problem

AI coding assistants (Cursor, Windsurf, Qoder, etc.) use configuration files to guide their behavior:
- Agent rules (coding standards, best practices)
- Skills (reusable prompt templates)
- Workflows (reusable commands and prompts)

Managing these across multiple projects means:
- Manually copying configuration folders between projects
- Losing track of which configs work with which tech stacks
- No easy way to organize or search through your prompt library
- Difficult to share configurations with team members

## What Promption Does

**Desktop App:**
- Centralized library for your AI agent configurations
- Tag by technology (React, Python, Rust, etc.)
- Full-text search
- Syntax highlighting for better readability
- Keyboard shortcuts for faster workflow

**CLI:**
```bash
# List your saved configurations
promption list

# Export selected configs to current project
promption sync --ids=abc123,def456

# Creates folder structure based on your tool's convention:
# .agent/, .cursor/, .aider/, etc.
```

**Supported Tools:**
- ✅ Antigravity IDE
- 🔜 Cursor, Windsurf, Opencode, Claude Code (planned)

## Features

- **Local Storage**: All data stored in SQLite on your machine
- **Single Binary**: Works as both GUI and CLI
- **Smart Organization**: Tag and categorize your configurations
- **Keyboard Navigation**: Full keyboard shortcuts
- **Cross-Platform**: Works on macOS, Linux, and Windows

## Installation

Download from [releases](https://github.com/Abdssamie/promption/releases) or build from source:

```bash
git clone https://github.com/Abdssamie/promption.git
cd promption
bun install
bun run tauri build
```

**Requirements:**
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)

## Usage

### Desktop App

1. Launch the app
2. Create and organize your skills, rules, and workflows
3. Add technology tags for easier filtering
4. Select items you want to use in a project
5. Click "Copy Cmd" to get the sync command

### CLI

```bash
# List all items
promption list
promption list --type=skill

# Export to current directory
promption sync --ids=abc123,def456
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New skill |
| `Ctrl+Shift+S/R/W` | New skill/rule/workflow |
| `Ctrl+A` | Select all |
| `Ctrl+D` | Deselect all |
| `Ctrl+C` | Copy sync command |
| `Ctrl+F` | Focus search |
| `Esc` | Close / Deselect |

## Tech Stack

- **Core**: Tauri v2, Rust
- **Frontend**: React 19, TypeScript, Vite
- **UI**: TailwindCSS v4, Shadcn/UI
- **State**: Zustand
- **Database**: SQLite
- **CLI**: Clap, Rusqlite

## Development

```bash
# Run in dev mode
bun run tauri dev

# Run tests
bun test

# Build
bun run tauri build
```

## License

[MIT](LICENSE)  
- 🔜 **OpenCode** - Coming soon
- 🔜 **Claude Desktop** - Coming soon

## 🚀 Key Features

- **🔒 Privacy First**: All data stored locally in SQLite. No cloud, no tracking.
- **⚡ Unified Binary**: Single executable works as both GUI and CLI.
- **🏷️ Smart Tagging**: Organize by technology, project type, or custom tags.
- **⌨️ Keyboard Navigation**: Full keyboard shortcuts for zero-mouse workflow.
- **🎨 Modern UI**: Built with React 19, Tauri v2, and Shadcn/UI.
- **🌑 Dark/Light Mode**: Adaptive theming for day and night coding.

## 🛠️ Tech Stack

- **Core**: [Tauri v2](https://v2.tauri.app/), [Rust](https://www.rust-lang.org/)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Database**: SQLite (via tauri-plugin-sql)
- **CLI**: Rust + Clap + Rusqlite

## 📦 Installation

**Pre-built binaries** (recommended):
```bash
# Download from releases
# https://github.com/Abdssamie/promption/releases
```

**Build from source:**
```bash
git clone https://github.com/Abdssamie/promption.git
cd promption
bun install
bun run tauri build
```

**Requirements:**
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (LTS)
- [Bun](https://bun.sh/)

## 🎮 Usage

### Desktop App

1. **Launch Promption** (double-click the app)
2. **Create items**: Skills, Rules, or Workflows
3. **Tag them**: Add technology tags (React, Python, etc.)
4. **Select items** you want to sync to a project
5. **Click "Copy Cmd"** to get the CLI command

### CLI

```bash
# List all items
promption list
promption list --type=skill

# Sync to current directory
promption sync --ids=abc123,def456

# Result: .agent/ folder created with your configs
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new skill |
| `Ctrl+Shift+S` | Create skill |
| `Ctrl+Shift+R` | Create rule |
| `Ctrl+Shift+W` | Create workflow |
| `Ctrl+A` | Select all items |
| `Ctrl+D` | Deselect all |
| `Ctrl+C` | Copy sync command |
| `Ctrl+F` | Focus search |
| `Esc` | Close dialog / Deselect |

## 🧪 Development

```bash
# Run in dev mode
bun run tauri dev

# Run tests
bun test

# Build for production
bun run tauri build
```

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

## 📄 License

[MIT](LICENSE)
