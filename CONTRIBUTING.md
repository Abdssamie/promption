# Contributing to Promption

Thank you for your interest in contributing to Promption!

## Development Setup

1.  **Prerequisites**:
    *   [Rust](https://www.rust-lang.org/tools/install)
    *   [Node.js](https://nodejs.org/) (LTS)
    *   [Bun](https://bun.sh/)
    *   [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

2.  **Clone & Install**:
    ```bash
    git clone https://github.com/Abdssamie/promption.git
    cd promption
    bun install
    ```

3.  **Run Development Server**:
    ```bash
    # This runs the Tauri backend + React frontend
    bun run tauri dev
    ```

## Project Structure

*   `src-tauri/`: Rust backend (CLI logic, Database connections).
*   `src/`: React frontend.
*   `src/services/database.ts`: Frontend-side database interface.

## Submitting Changes

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## Code Style

*   **Frontend**: We use ESLint and Prettier. Run `bun lint` before committing.
*   **Backend**: Run `cargo fmt` and `cargo clippy`.
