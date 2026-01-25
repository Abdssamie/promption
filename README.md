# Promption

**Promption** is a modern, privacy-focused AI prompt manager application built for speed and efficiency. It allows you to organize, refine, and manage your AI prompts in a beautiful, native desktop environment.

Built with performance and aesthetics in mind, Promption leverages the power of **Tauri** for a lightweight footprint and **React** for a dynamic user interface.

## ✨ Key Features

- **🚀 Native Performance**: Built on Rust and Tauri for blazing fast performance and low memory usage.
- **🎨 Modern CI/UI**: sleek, accessible interface powered by Shadcn/UI and TailwindCSS v4.
- **📝 Syntax Highlighting**: Rich editing experience for your prompts with `react-syntax-highlighter`.
- **🔒 Privacy First**: Your prompts are stored locally using SQLite. No external servers.
- **⚡ productivity Focused**: Keyboard shortcuts and streamlined workflows.
- **🌑 Dark/Light Mode**: Fully themable interface.

## 🛠️ Tech Stack

- **Core**: [Tauri v2](https://v2.tauri.app/), [Rust](https://www.rust-lang.org/)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/), [Remix Icons](https://remixicon.com/), [Simple Icons](https://simpleicons.org/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **[Rust & Cargo](https://www.rust-lang.org/tools/install)** (Required for Tauri)
- **[Node.js](https://nodejs.org/)** (LTS recommended)
- **[Bun](https://bun.sh/)** (Package manager used in this project)

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Abdssamie/promption.git
    cd promption
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Run in development mode:**

    ```bash
    bun run tauri dev
    ```
    This will start the frontend dev server and open the localized Tauri window.

## 🏗️ Building for Production

To build the application for your OS:

```bash
bun run tauri build
```

The build artifacts will be located in the `src-tauri/target/release/bundle` directory.

## 🧪 Testing

Run the test suite with Vitest:

```bash
# Run tests
bun run test

# Run validation with coverage
bun run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
