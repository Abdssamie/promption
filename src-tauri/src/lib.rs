use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "Create initial tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS items (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    content TEXT NOT NULL,
                    item_type TEXT NOT NULL CHECK(item_type IN ('skill', 'rule', 'workflow')),
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS tags (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL UNIQUE,
                    color TEXT NOT NULL DEFAULT '#6366f1'
                );

                CREATE TABLE IF NOT EXISTS item_tags (
                    item_id TEXT NOT NULL,
                    tag_id TEXT NOT NULL,
                    PRIMARY KEY (item_id, tag_id),
                    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);
                CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
            "#,
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:promption.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
