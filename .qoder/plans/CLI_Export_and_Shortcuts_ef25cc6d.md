# CLI Export and Keyboard Shortcuts

## Overview

This plan implements three main changes:
1. A standalone `promption` CLI binary in the same Cargo workspace
2. Replace file-dialog export with a "Copy Command" workflow in the UI
3. Add keyboard shortcuts for common actions

---

## Part 1: CLI Binary Implementation

### 1.1 Create CLI Binary

Add a new binary target in `src-tauri/Cargo.toml`:

```toml
[[bin]]
name = "promption"
path = "src/cli.rs"

[dependencies]
# Add clap for CLI argument parsing
clap = { version = "4", features = ["derive"] }
rusqlite = { version = "0.31", features = ["bundled"] }
dirs = "5"
```

### 1.2 Create `src-tauri/src/cli.rs`

The CLI will:
- Parse arguments: `promption sync --ids=id1,id2,id3`
- Connect to SQLite at `~/.config/com.abdssamie.promption/promption.db`
- Query items by ID
- Create `.agent/` structure in current directory:
  ```
  .agent/
    skills/
      skill-name/SKILL.md
    rules/
      rule-name.md
    workflows/
      workflow-name.md
  ```

Key functions:
```rust
#[derive(Parser)]
#[command(name = "promption", about = "AI Prompt Manager CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Sync selected items to .agent directory
    Sync {
        #[arg(long, value_delimiter = ',')]
        ids: Vec<String>,
    },
    /// List all items (optional)
    List {
        #[arg(short, long)]
        type_filter: Option<String>,
    },
}
```

### 1.3 Database Access

Reuse the same database path logic:
```rust
fn get_db_path() -> PathBuf {
    dirs::config_dir()
        .unwrap()
        .join("com.abdssamie.promption")
        .join("promption.db")
}
```

---

## Part 2: UI Changes

### 2.1 Replace Export with "Copy Command"

Modify `src/components/FloatingActions.tsx`:
- Remove the `handleExport` function that uses file dialogs
- Replace Export button with "Copy Command" button
- When clicked, generate and copy: `promption sync --ids=id1,id2,id3`
- Show toast: "Command copied! Run in your project directory"

### 2.2 Remove Export Service

Delete or simplify `src/services/export.ts`:
- Remove the file dialog-based export function
- Keep the `slugify` helper if needed elsewhere, or remove entirely

### 2.3 Update Tauri Capabilities

In `src-tauri/capabilities/default.json`:
- Remove `fs` permissions only (the problematic file system access)
- Keep dialog permissions (still useful for other features)

---

## Part 3: Keyboard Shortcuts

### 3.1 Create Keyboard Hook

Create `src/hooks/useKeyboardShortcuts.ts`:

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | Open create dialog (default: skill) |
| Ctrl/Cmd + Shift + S | Create skill |
| Ctrl/Cmd + Shift + R | Create rule |
| Ctrl/Cmd + Shift + W | Create workflow |
| Ctrl/Cmd + A | Select all visible items |
| Ctrl/Cmd + D | Deselect all |
| Ctrl/Cmd + C | Copy command (if items selected) |
| Ctrl/Cmd + F | Focus search bar |
| Escape | Close dialog / Deselect all |

### 3.2 Integrate in App.tsx

```tsx
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();
  // ...
}
```

### 3.3 Add Search Bar Ref

Add a ref to SearchBar for keyboard focus:
```tsx
// In SearchBar.tsx
const inputRef = useRef<HTMLInputElement>(null);
// Expose via imperative handle or global event
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `src-tauri/Cargo.toml` | Add CLI binary target, clap, rusqlite, dirs |
| `src-tauri/src/cli.rs` | **NEW** - CLI implementation |
| `src/components/FloatingActions.tsx` | Replace Export with Copy Command |
| `src/services/export.ts` | Delete file |
| `src/hooks/useKeyboardShortcuts.ts` | **NEW** - Keyboard shortcuts hook |
| `src/App.tsx` | Add useKeyboardShortcuts |
| `src/components/SearchBar.tsx` | Add ref for keyboard focus |
| `src-tauri/capabilities/default.json` | Remove fs permissions only |

---

## Testing Plan

1. Build CLI: `cd src-tauri && cargo build --release --bin promption`
2. Test CLI: `./target/release/promption sync --ids=<test-id>`
3. Verify `.agent/` structure created correctly
4. Test keyboard shortcuts in app
5. Test "Copy Command" button copies correct command

---

## Installation Note

After building, users can copy the CLI binary to their PATH:
```bash
cp src-tauri/target/release/promption ~/.local/bin/
# or system-wide: sudo cp ... /usr/local/bin/
```
