use clap::{Parser, Subcommand, ValueEnum};
use rusqlite::{Connection, Result as SqliteResult};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "promption", about = "AI Prompt Manager", version)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Sync selected items to the project configuration
    Sync {
        /// Comma-separated list of item IDs to sync
        #[arg(long, value_delimiter = ',')]
        ids: Vec<String>,

        /// Target tool format
        #[arg(long, value_enum, default_value_t = ToolTarget::Antigravity)]
        target: ToolTarget,
    },
    /// List all items in the database
    List {
        /// Filter by item type (skill, rule, workflow)
        #[arg(short, long)]
        r#type: Option<String>,
    },
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
pub enum ToolTarget {
    Antigravity,
    Cursor,
    Windsurf,
    Opencode,
    Cline,
    Copilot,
}

#[derive(Debug)]
struct Item {
    id: String,
    name: String,
    content: String,
    item_type: String,
}

fn get_db_path() -> PathBuf {
    dirs::config_dir()
        .expect("Could not find config directory")
        .join("com.abdssamie.promption")
        .join("promption.db")
}

fn slugify(name: &str) -> String {
    let sanitized: String = name
        .replace(['\\', '/'], "-")
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect();

    // Remove leading/trailing dashes and collapse multiple dashes
    let result: String = sanitized
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-");

    if result.is_empty() {
        "unnamed".to_string()
    } else {
        result
    }
}

fn get_items_by_ids(conn: &Connection, ids: &[String]) -> SqliteResult<Vec<Item>> {
    if ids.is_empty() {
        return Ok(vec![]);
    }

    let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();
    let query = format!(
        "SELECT id, name, content, item_type FROM items WHERE id IN ({})",
        placeholders.join(", ")
    );

    let mut stmt = conn.prepare(&query)?;
    let params: Vec<&dyn rusqlite::ToSql> = ids.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let items = stmt.query_map(params.as_slice(), |row| {
        Ok(Item {
            id: row.get(0)?,
            name: row.get(1)?,
            content: row.get(2)?,
            item_type: row.get(3)?,
        })
    })?;

    items.collect()
}

fn get_all_items(conn: &Connection, type_filter: Option<&str>) -> SqliteResult<Vec<Item>> {
    let query = match type_filter {
        Some(_) => "SELECT id, name, content, item_type FROM items WHERE item_type = ? ORDER BY updated_at DESC",
        None => "SELECT id, name, content, item_type FROM items ORDER BY updated_at DESC",
    };

    let mut stmt = conn.prepare(query)?;

    let rows: Vec<SqliteResult<Item>> = if let Some(t) = type_filter {
        stmt.query_map([t], |row| {
            Ok(Item {
                id: row.get(0)?,
                name: row.get(1)?,
                content: row.get(2)?,
                item_type: row.get(3)?,
            })
        })?
        .collect()
    } else {
        stmt.query_map([], |row| {
            Ok(Item {
                id: row.get(0)?,
                name: row.get(1)?,
                content: row.get(2)?,
                item_type: row.get(3)?,
            })
        })?
        .collect()
    };

    rows.into_iter().collect()
}

fn sync_items(items: &[Item], target: ToolTarget) -> std::io::Result<()> {
    match target {
        ToolTarget::Antigravity => sync_antigravity(items),
        ToolTarget::Cursor => sync_cursor(items),
        ToolTarget::Windsurf => sync_windsurf(items),
        ToolTarget::Opencode => sync_opencode(items),
        ToolTarget::Cline => sync_cline(items),
        ToolTarget::Copilot => sync_copilot(items),
    }
}

fn sync_antigravity(items: &[Item]) -> std::io::Result<()> {
    let agent_path = PathBuf::from(".agent");
    let skills_path = agent_path.join("skills");
    let rules_path = agent_path.join("rules");
    let workflows_path = agent_path.join("workflows");

    fs::create_dir_all(&skills_path)?;
    fs::create_dir_all(&rules_path)?;
    fs::create_dir_all(&workflows_path)?;

    for item in items {
        let slug = slugify(&item.name);
        match item.item_type.as_str() {
            "skill" => {
                let skill_dir = skills_path.join(&slug);
                fs::create_dir_all(&skill_dir)?;
                fs::write(skill_dir.join("SKILL.md"), &item.content)?;
                println!("  + .agent/skills/{}/SKILL.md", slug);
            }
            "rule" => {
                fs::write(rules_path.join(format!("{}.md", slug)), &item.content)?;
                println!("  + .agent/rules/{}.md", slug);
            }
            "workflow" => {
                fs::write(workflows_path.join(format!("{}.md", slug)), &item.content)?;
                println!("  + .agent/workflows/{}.md", slug);
            }
            _ => {}
        }
    }
    Ok(())
}

fn sync_cursor(items: &[Item]) -> std::io::Result<()> {
    let rules_path = PathBuf::from(".cursor/rules");
    fs::create_dir_all(&rules_path)?;

    for item in items {
        let slug = slugify(&item.name);
        // Cursor uses .mdc for rules with frontmatter
        if item.item_type == "rule" {
            let content = format!(
                "---\ndescription: {}\nglobs: *\n---\n\n{}",
                item.name, item.content
            );
            fs::write(rules_path.join(format!("{}.mdc", slug)), content)?;
            println!("  + .cursor/rules/{}.mdc", slug);
        } else {
            // Treat skills/workflows as regular markdown docs for context
            fs::write(rules_path.join(format!("{}.md", slug)), &item.content)?;
            println!("  + .cursor/rules/{}.md", slug);
        }
    }
    Ok(())
}

fn sync_windsurf(items: &[Item]) -> std::io::Result<()> {
    let rules_path = PathBuf::from(".windsurf/rules");
    let skills_path = PathBuf::from(".windsurf/skills");
    fs::create_dir_all(&rules_path)?;
    fs::create_dir_all(&skills_path)?;

    for item in items {
        let slug = slugify(&item.name);
        match item.item_type.as_str() {
            "skill" => {
                let skill_dir = skills_path.join(&slug);
                fs::create_dir_all(&skill_dir)?;
                let content = format!(
                    "---\nname: {}\ndescription: {}\n---\n\n{}",
                    slug, item.name, item.content
                );
                fs::write(skill_dir.join("SKILL.md"), content)?;
                println!("  + .windsurf/skills/{}/SKILL.md", slug);
            }
            _ => {
                // Rules and Workflows go to rules/
                fs::write(rules_path.join(format!("{}.md", slug)), &item.content)?;
                println!("  + .windsurf/rules/{}.md", slug);
            }
        }
    }
    Ok(())
}

fn sync_opencode(items: &[Item]) -> std::io::Result<()> {
    let rules_path = PathBuf::from(".opencode/rules");
    let skills_path = PathBuf::from(".opencode/skills");
    fs::create_dir_all(&rules_path)?;
    fs::create_dir_all(&skills_path)?;

    for item in items {
        let slug = slugify(&item.name);
        match item.item_type.as_str() {
            "skill" => {
                let skill_dir = skills_path.join(&slug);
                fs::create_dir_all(&skill_dir)?;
                let content = format!(
                    "---\nname: {}\ndescription: {}\n---\n\n{}",
                    slug, item.name, item.content
                );
                fs::write(skill_dir.join("SKILL.md"), content)?;
                println!("  + .opencode/skills/{}/SKILL.md", slug);
            }
            _ => {
                fs::write(rules_path.join(format!("{}.md", slug)), &item.content)?;
                println!("  + .opencode/rules/{}.md", slug);
            }
        }
    }
    Ok(())
}

fn sync_cline(items: &[Item]) -> std::io::Result<()> {
    let rules_path = PathBuf::from(".clinerules");
    let skills_path = PathBuf::from(".cline/skills");
    fs::create_dir_all(&rules_path)?;
    fs::create_dir_all(&skills_path)?;

    for item in items {
        let slug = slugify(&item.name);
        match item.item_type.as_str() {
            "skill" => {
                let skill_dir = skills_path.join(&slug);
                fs::create_dir_all(&skill_dir)?;
                let content = format!(
                    "---\nname: {}\ndescription: {}\n---\n\n{}",
                    slug, item.name, item.content
                );
                fs::write(skill_dir.join("SKILL.md"), content)?;
                println!("  + .cline/skills/{}/SKILL.md", slug);
            }
            _ => {
                fs::write(rules_path.join(format!("{}.md", slug)), &item.content)?;
                println!("  + .clinerules/{}.md", slug);
            }
        }
    }
    Ok(())
}

fn sync_copilot(items: &[Item]) -> std::io::Result<()> {
    let github_path = PathBuf::from(".github");
    fs::create_dir_all(&github_path)?;
    let instructions_path = github_path.join("copilot-instructions.md");

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&instructions_path)?;

    for item in items {
        writeln!(file, "\n\n# {}\n{}", item.name, item.content)?;
        println!("  + Appended to .github/copilot-instructions.md");
    }
    Ok(())
}

/// Run CLI commands. Returns true if a command was executed, false if GUI should launch.
pub fn run() -> bool {
    let cli = Cli::parse();

    // If no subcommand, return false to launch GUI
    let command = match cli.command {
        Some(cmd) => cmd,
        None => return false,
    };

    let db_path = get_db_path();

    if !db_path.exists() {
        eprintln!("Error: Promption database not found at {:?}", db_path);
        eprintln!("Make sure you have run the Promption app at least once.");
        std::process::exit(1);
    }

    let conn = match Connection::open(&db_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error: Could not open database: {}", e);
            std::process::exit(1);
        }
    };

    match command {
        Commands::Sync { ids, target } => {
            if ids.is_empty() {
                eprintln!("Error: No item IDs provided. Use --ids=id1,id2,id3");
                std::process::exit(1);
            }

            println!(
                "Syncing {} item(s) to {:?} configuration...",
                ids.len(),
                target
            );

            match get_items_by_ids(&conn, &ids) {
                Ok(items) => {
                    if items.is_empty() {
                        eprintln!("Warning: No items found with the provided IDs");
                        std::process::exit(1);
                    }

                    if items.len() != ids.len() {
                        eprintln!(
                            "Warning: Found {} items, expected {} (some IDs may be invalid)",
                            items.len(),
                            ids.len()
                        );
                    }

                    match sync_items(&items, target) {
                        Ok(()) => {
                            println!("\nDone! {} item(s) synced.", items.len());
                        }
                        Err(e) => {
                            eprintln!("Error writing files: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::List { r#type } => {
            let type_filter = r#type.as_deref();

            match get_all_items(&conn, type_filter) {
                Ok(items) => {
                    if items.is_empty() {
                        println!("No items found.");
                        return true;
                    }

                    println!("{:<36}  {:<10}  {}", "ID", "TYPE", "NAME");
                    println!("{}", "-".repeat(70));

                    for item in items {
                        println!("{:<36}  {:<10}  {}", item.id, item.item_type, item.name);
                    }
                }
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }

    true
}
