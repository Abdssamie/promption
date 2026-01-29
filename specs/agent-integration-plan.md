# AI Agent Integration Plan

This document outlines the configuration schemas and file conventions for integrating Promption with popular AI coding agents.

## Supported Agents & Conventions

### 1. Cursor
*   **Legacy Rules:** `.cursorrules` (Markdown, project root).
*   **Project Rules (New):** `.cursor/rules/*.mdc` (Markdown + Frontmatter).
    *   **Frontmatter:** `description` (string), `globs` (string pattern).
*   **Custom Commands:** `.cursor/commands/*.md` (Beta).

### 2. Windsurf (Codeium)
*   **Rules:** `.windsurf/rules/` (Markdown files, auto-discovered).
    *   Can be in project root or subdirectories.
*   **Skills:** `.windsurf/skills/<skill-name>/SKILL.md` (Markdown + Frontmatter).
    *   **Frontmatter:** `name` (regex `^[a-z0-9]+(-[a-z0-9]+)*$`), `description` (max 1024 chars).
    *   **Structure:** Folder can contain helper scripts/files referenced in `SKILL.md`.
*   **Memories:** Auto-generated, not manually configured via file export usually.

### 3. OpenCode
*   **Rules:**
    *   `AGENTS.md` (Project root).
    *   `.opencode/rules/*.md`.
*   **Commands:** `.opencode/commands/<name>.md` (Markdown + Frontmatter).
    *   **Frontmatter:** `description`, `agent` (optional), `model` (optional).
    *   **Syntax:** Supports `$ARGUMENTS`, `$1`, `$2`, `!command`, `@filename`.
*   **Skills:** `.opencode/skills/<name>/SKILL.md` (Same schema as Windsurf/Claude).

### 4. Cline (VS Code Extension)
*   **Rules:** `.clinerules/` containing `*.md` files (combined context).
*   **Skills:** `.cline/skills/<name>/SKILL.md` (Markdown + Frontmatter).
    *   **Frontmatter:** `name`, `description`.

### 5. GitHub Copilot
*   **Instructions:** `.github/copilot-instructions.md` (Markdown, project root or `.github/`).
*   **Workspace (Technical Preview):** `.github/copilot-workspace/config.json`.
    *   **Schema:** `commands: [{ id, step, command, description }]`.

## Implementation Strategy for Promption

Promption will support an "Export to Agent" feature that writes the appropriate files based on the user's selected tool.

### Data Mapping

| Promption Concept | Cursor | Windsurf | OpenCode | Cline | Copilot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule** | `.cursor/rules/*.mdc` | `.windsurf/rules/*.md` | `.opencode/rules/*.md` | `.clinerules/*.md` | `copilot-instructions.md` (Appended) |
| **Skill** | (via Agent Skills) | `.windsurf/skills/*/SKILL.md` | `.opencode/skills/*/SKILL.md` | `.cline/skills/*/SKILL.md` | - |
| **Workflow** | `.cursor/commands/*.md` | (Workflows feature) | `.opencode/commands/*.md` | - | `config.json` (partial) |
| **Prompt** | Copy to Clipboard | Copy to Clipboard | Copy to Clipboard | Copy to Clipboard | Copy to Clipboard |

### Action Items
1.  **Schema Definitions:** Create TypeScript interfaces for these file formats.
2.  **Export Service:** Implement a service to generate these file structures from Promption items.
3.  **UI Integration:** Add "Export" options in the Item Editor or a dedicated "Integrations" settings page.
