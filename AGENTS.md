# Agent Guidelines for Promption

This document provides coding guidelines and commands for AI agents working on the Promption codebase.

## Project Overview

Promption is a **Tauri + React + TypeScript** desktop application for managing AI prompts, skills, rules, and workflows. It uses:
- **Frontend**: React 19, TypeScript, Vite, shadcn/ui, Tailwind CSS v4
- **Backend**: Tauri v2, Rust, SQLite (via tauri-plugin-sql)
- **State**: Zustand with reactive computed state
- **Testing**: Vitest, React Testing Library, happy-dom
- **Package Manager**: Bun
- **Font**: Fira Code (monospace for entire app)

## Build, Run & Test Commands

### Development
```bash
# ⚠️ CRITICAL: Always run the full Tauri app (NOT just Vite)
bun tauri dev              # Correct - Runs Tauri + Rust backend + Vite dev server
bun run dev                # Wrong - Only Vite (no Tauri API, database won't work)

# Build for production
bun run build              # TypeScript check + Vite build (frontend only)
bun tauri build            # Full Tauri app build (creates executable)

# Type checking only
tsc --noEmit               # Run TypeScript compiler without emitting files
```

### Testing
```bash
# Run all tests
bun test

# Run tests in watch mode (auto-rerun on file changes)
bun test:watch

# Run a single test file
bun test src/components/SearchBar.test.tsx

# Run tests matching a pattern (e.g., all SearchBar tests)
bun test SearchBar

# Run with coverage report
bun test:coverage
```

## Code Style Guidelines

### Import Order (Strictly Enforced)
1. External libraries (React, third-party packages)
2. Tauri/plugin imports
3. Internal utilities and types (use `type` imports for types)
4. shadcn/ui components (from `@/components/ui/*`)
5. Local components
6. Constants and assets

```typescript
// ✅ Good
import { useState } from 'react';
import { Save, Eye, Edit3 } from 'lucide-react';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { useAppStore } from '../store/appStore';
import { cn, getItemTypeColor } from '../lib/utils';
import type { Item, ItemType } from '../types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { POPULAR_TECHNOLOGIES } from '../constants/technologies';
```

### Component Structure
```typescript
// 1. Imports (following order above)
// 2. Types/Interfaces (props, local types)
// 3. Constants (UPPER_SNAKE_CASE)
// 4. Component function
// 5. Helper components (if any)
// 6. Exports

interface MyComponentProps {
    item: Item;
    onClose: () => void;
}

export function MyComponent({ item, onClose }: MyComponentProps) {
    // 1. Zustand selectors (use selector pattern)
    const items = useAppStore((s) => s.items);
    const createItem = useAppStore((s) => s.createItem);
    
    // 2. React hooks (useState, useEffect, etc.)
    const [isLoading, setIsLoading] = useState(false);
    
    // 3. Derived state
    const isValid = item.name.length > 0;
    
    // 4. Event handlers
    const handleSave = async () => { /* n    
    // 5. Render (early returns for loading/error states)
    if (isLoading) return <Loader />;
    
    return <div>...</div>;
}
```

### TypeScript Guidelines

**Strict mode is enabled** - Always use explicit types:
```typescript
// ✅ Good
const items: Item[] = [];
function getItem(id: string): Item | null { }
const [count, setCount] = useState<number>(0);

// ❌ Bad
const items = [];
function getItem(id) { }
const [count, setCount] = useState(0); // Inferred, but be explicit
```

**Use type imports for types only:**
```typescript
// ✅ Good
import type { Item, ItemType } from '../types';
import { createItem } from '../services/database';

// ❌ Bad
import { Item, ItemType } from '../types';
```

**Handle nulls/undefined explicitly:**
```typescript
// ✅ Good
const item = await getItemById(id);
if (!item) {
    console.error('Item not found');
    return null;
}
return item.name;

// ❌ Bad
const item = await getItemById(id);
return item.name; // Could crash if null
```

### Naming Conventions

- **Components**: PascalCase (`SearchBar`, `ItemEditor`)
- **Functions/Variables**: camelCase (`handleSave`, `toggleTag`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`TAG_COLORS`, `POPULAR_TECHNOLOGIES`)
- **Types/Interfaces**: PascalCase (`Item`, `ItemFormData`, `AppState`)
- **Files**: Match component name (`SearchBar.tsx`, `ItemEditor.tsx`)
- **Test files**: `ComponentName.test.tsx` (next to component)
- **Service files**: camelCase (`database.ts`, `export.ts`)

### shadcn/ui Component Usage

**CRITICAL**: Always use shadcn/ui primitives, never raw HTML elements for UI:

```typescript
// ✅ Good - Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

<Button variant="ghost" size="sm">Click</Button>
<Input type="text" placeholder="Search..." />

// ❌ Bad - Don't use raw HTML
<button className="...">Click</button>
<input type="text" className="..." />
```

**Available shadcn/ui components:**
- `Button` (variants: default, ghost, outline, secondary, destructive)
- `Input`, `Textarea`, `Label`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Badge` (variants: default, secondary, outline, destructive)
- `Checkbox`

###tyling Guidelines

**Use Tailwind utility classes with design tokens:**
```typescript
// ✅ Good - Use design tokens
className="text-muted-foreground bg-background border-border"

// ❌ Bad - Don't use arbitrary values
className="text-gray-500 bg-white border-gray-200"
```

**DO NOT modify `src/index.css`** - Theme variables are strictly off-limits unless explicitly required.

**Use `cn()` helper for conditional classes:**
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
    "base-classes",
    isActive && "active-classes",
    variant === "primary" && "primary-classes"
)} />
```

**Design System:**
- **Primary color**: Orange (`oklch(0.646 0.222 41.116)`)
- **Font**: Fira Code (monospace throughout app)
- **Dark mode**: Supported via `next-themes`, use `dark:` prefix
- **Responsive**: Mobile-first (sm, md, lg, xl breakpoints)

### State Management (Zustand)

**CRITICAL**: Always use selector pattern, never select entire store:

```typescript
// ✅ Good - Selector pattern (only re-renders when specific value changes)
const items = useAppStore((s) => s.items);
const filteredItems = useAppStore((s) => s.filteredItems); // Use reactive state
const createItem = useAppStore((s) => s.createItem);

// ❌ Bad - Selects entire store (re-renders on any state change)
const store = useAppStore();

// ❌ Bad - Don't call getFilteredItems() function
const getFilteredItems = useAppStore((s) => s.getFilteredItems);
const items = getFilteredItems(); // Use s.filteredItems instead
```

**Reactive computed state**: The store has `filteredItems` as reactive state that automatically updates when `items`, `searchQuery`, `typeFilter`, or `tagFilter` change.

### Error Handling

**Always use try-catch-finally for async operations:**
```typescript
// ✅ Good - Propendling with loading states
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
    setIsSaving(true);
    try {
        await createItem(data);
        console.log('Item created successfully');
        onClose();
    } catch (error) {
        console.error('Failed to save item:', error);
        // Optionally show user-facing error message
    } finally {
        setIsSaving(false);
    }
};
```

**Logging conventions:**
- Use `console.log()` for successful operations
- Use `console.error()` for errors
- Include relevant IDs/context in logs

### Tauri-Specific Guidelines

**Database operations** - Always use the service layer:
```typescript
// ✅ Good - Use service layer
import * as db from '../services/database';
const items = await db.getAllItems();

// ❌ Bad - Don't call Tauri directly in components
import Database from '@tauri-apps/plugin-sql';
```

**File operations** - Use Tauri plugins:
```typescript
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
```

**Webview API** - For zoom control:
```typescript
import { getCurrentWebview } from '@tauri-apps/api/webview';

const webview = getCurrentWebview();
await webview.setZoom(1.25); zoom
```

**Database location**: SQLite database is at `~/.config/com.abdssamie.promption/promption.db`

## Testing Guidelines

**Test file structure:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../tests/test-utils';
import { MyComponent } from './MyComponent';

// Mock Zustand store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

describe('MyComponent', () => {
    beforeEach(() => {
        // Setup mocks
    });

    it('should render correctly', () => {
        render(<MyComponent />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
```

**Testing best practices:**
- Place tests next to components: `Component.test.tsx`
- Use React Testing Library queries: `getByRole`, `getByText`, `getByPlaceholderText`
- Mock Zustand store for isolated tests
- Test user interactions, not implementation details
- Use `userEvent` for simulating user actions
- Use mock factories from `test-utils.tsx` for creating test data

## UI/UX Patterns

### Technology Icons
- Use `TechIcon` component with `simple-icons` package
- Icons keep brand colors, text uses standard foreground color
- Non-tech tags show `#` symbol in muted color
- Icon sizes: 16px for tags, 14px for filters

```typescript
import { TechIcon } from './TechIcon';
import { POPULAR_TECHNOLOGIES } from '../constants/technologies';

const tech = POPULAR_TECHNOLOGIES.find(
    t => t.name.toLowerCase() === tag.name.toLowerCase()
);

{tech ? (
    <TechIcon slug={tech.iconSlug} size={16} color={tech.color} />
) : (
    <span className="text-muted-foreground">#</span>
)}
```

### Component Patterns
- **Delete actions**: No confirmation dialogs, delete immediately
- **Checkbox position**: Bottom-right of cards, visible on hoveale animation
- **Floating actions**: Bottom-right widget for Tags/Export/Create buttons
- **Syntax highlighting**: Theme-aware (oneDark for dark, oneLight for light)
- **Loading states**: Always show loading indicators for async operations

## Common Pitfalls

1. **Running wrong dev command** - Use `bun tauri dev`, not `bun run dev`
2. **Not using shadcn/ui** - Always use shadcn components, never raw HTML
3. **Modifying index.css** - Theme variables are off-limits
4. **Missing type annotations** - Always provide explicit types
5. **Selecting entire Zustand store** - Use selector pattern: `useAppStore((s) => s.items)`
6. **Using getFilteredItems() function** - Use `filteredItems` reactive state instead
7. **Forgetting loading states** - Always handle async operations with loading states
8. **Silent errors** - Always log errors with `console.error()`
9. **Not using try-catch** - Wrap all async operations in try-catch blocks
10. **Committing without permission** - Always ask before committing changes

## File Structure

```
src/
├── components/          # React components (use shadcn/ui)
│   ├── ui/             # shadcn/ui primitives (don't modify)
│   ├── Header.tsx      # App header with controls
│   ├── ItemCard.tsx    # Item display card
│   ├── FloatingActions.tsx  # Bottom-right action widget
│   └── *.test.tsx      # Tests next to components
├── services/            # API service layer (database, export)
├── store/               # Zustand state management (appStore.ts)
├── lib/                 # Utilities (utils.ts with cn, getItemTypeColor, etc.)
├── types/               # TypeScript type definitions
├── constants/           # App constants (technologies.ts)
└── tests/               # Test setup and utilities
```

## Additional Resources

- shadcn/ui docs: https://ui.shadcn.com
- Tauri v2 docs: https://v2.tauri.app
- Zustand docs: https://zustand-demo.pmnd.rs
- Vitest docs: https://vitest.dev
- Tailwind CSS v4: https://tailwindcss.com
- simple-icons: https://simpleicons.org

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
