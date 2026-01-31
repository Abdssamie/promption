use clap::{Parser, Subcommand, ValueEnum};
use rusqlite::{Connection, Result as SqliteResult};
use serde_json::{json, Value};
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
    /// Sync agent configurations to opencode.json
    SyncAgents {
        /// Comma-separated list of agent IDs to sync
        #[arg(long, value_delimiter = ',')]
        ids: Vec<String>,
    },
    /// List all agents
    ListAgents,
    /// Create a new agent
    CreateAgent {
        /// Agent name (kebab-case format)
        #[arg(long)]
        name: String,

        /// Agent mode: primary or subagent
        #[arg(long, value_enum, default_value_t = AgentModeArg::Subagent)]
        mode: AgentModeArg,

        /// AI model to use (optional)
        #[arg(long)]
        model: Option<String>,

        /// Prompt content (inline text or file path if --prompt-file is set)
        #[arg(long)]
        prompt: Option<String>,

        /// Treat prompt as file path (reads content from file)
        #[arg(long, default_value_t = false)]
        prompt_file: bool,

        /// Tools to enable (comma-separated, e.g., "write,edit,bash")
        #[arg(long, value_delimiter = ',')]
        tools: Vec<String>,

        /// Permissions (format: "perm:value" e.g., "edit:ask,bash:allow")
        #[arg(long, value_delimiter = ',')]
        permissions: Vec<String>,

        /// Output format
        #[arg(long, value_enum, default_value_t = OutputFormat::Text)]
        format: OutputFormat,
    },
    /// Get agent details by ID or name
    GetAgent {
        /// Agent ID or name
        #[arg(long)]
        id: String,

        /// Output format
        #[arg(long, value_enum, default_value_t = OutputFormat::Text)]
        format: OutputFormat,
    },
    /// Update an existing agent
    UpdateAgent {
        /// Agent ID to update
        #[arg(long)]
        id: String,

        /// New name (optional)
        #[arg(long)]
        name: Option<String>,

        /// New mode (optional)
        #[arg(long, value_enum)]
        mode: Option<AgentModeArg>,

        /// New model (optional)
        #[arg(long)]
        model: Option<String>,

        /// Clear model field
        #[arg(long, default_value_t = false)]
        clear_model: bool,

        /// New prompt content (optional)
        #[arg(long)]
        prompt: Option<String>,

        /// Treat prompt as file path
        #[arg(long, default_value_t = false)]
        prompt_file: bool,

        /// Clear prompt field
        #[arg(long, default_value_t = false)]
        clear_prompt: bool,

        /// Tools to enable (replaces existing)
        #[arg(long, value_delimiter = ',')]
        tools: Vec<String>,

        /// Clear all tools
        #[arg(long, default_value_t = false)]
        clear_tools: bool,

        /// Permissions to set (replaces existing)
        #[arg(long, value_delimiter = ',')]
        permissions: Vec<String>,

        /// Clear all permissions
        #[arg(long, default_value_t = false)]
        clear_permissions: bool,
    },
    /// Delete an agent
    DeleteAgent {
        /// Agent ID or name to delete
        #[arg(long)]
        id: String,
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

#[derive(Copy, Clone, PartialEq, Eq, ValueEnum, Debug)]
pub enum AgentModeArg {
    Primary,
    Subagent,
}

impl AgentModeArg {
    fn as_str(&self) -> &str {
        match self {
            AgentModeArg::Primary => "primary",
            AgentModeArg::Subagent => "subagent",
        }
    }
}

#[derive(Copy, Clone, PartialEq, Eq, ValueEnum, Debug)]
pub enum OutputFormat {
    Text,
    Json,
}

#[derive(Debug)]
struct Item {
    id: String,
    name: String,
    content: String,
    item_type: String,
}

#[derive(Debug)]
struct Agent {
    id: String,
    name: String,
    mode: String,
    model: Option<String>,
    prompt_content: Option<String>,
    tools_config: Option<String>,
    permissions_config: Option<String>,
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

fn validate_agent_name(name: &str) -> Result<(), String> {
    let kebab_case_regex = regex::Regex::new(r"^[a-z0-9]+(-[a-z0-9]+)*$").unwrap();
    if !kebab_case_regex.is_match(name) {
        return Err("Agent name must be in kebab-case format (lowercase letters, numbers, and hyphens only)".to_string());
    }
    if name.len() > 255 {
        return Err("Agent name exceeds maximum length of 255 characters".to_string());
    }
    Ok(())
}

fn parse_tools(tools: &[String]) -> SqliteResult<Option<String>> {
    if tools.is_empty() {
        return Ok(None);
    }
    
    let mut tools_map = serde_json::Map::new();
    for tool in tools {
        tools_map.insert(tool.clone(), serde_json::Value::Bool(true));
    }
    
    serde_json::to_string(&tools_map)
        .map(Some)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))
}

fn parse_permissions(permissions: &[String]) -> SqliteResult<Option<String>> {
    if permissions.is_empty() {
        return Ok(None);
    }
    
    let mut perms_map = serde_json::Map::new();
    for perm in permissions {
        let parts: Vec<&str> = perm.split(':').collect();
        if parts.len() != 2 {
            eprintln!("Warning: Invalid permission format '{}', skipping. Use 'name:value' format.", perm);
            continue;
        }
        let (key, value) = (parts[0], parts[1]);
        if !["ask", "allow", "deny"].contains(&value) {
            eprintln!("Warning: Invalid permission value '{}' for '{}', skipping. Use 'ask', 'allow', or 'deny'.", value, key);
            continue;
        }
        perms_map.insert(key.to_string(), serde_json::Value::String(value.to_string()));
    }
    
    if perms_map.is_empty() {
        return Ok(None);
    }
    
    serde_json::to_string(&perms_map)
        .map(Some)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))
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
        Commands::SyncAgents { ids } => {
            if ids.is_empty() {
                eprintln!("Error: No agent IDs provided. Use --ids=id1,id2,id3");
                std::process::exit(1);
            }

            println!("Syncing {} agent(s) to opencode.json...", ids.len());

            match get_agents_by_ids(&conn, &ids) {
                Ok(agents) => {
                    if agents.is_empty() {
                        eprintln!("Warning: No agents found with the provided IDs");
                        std::process::exit(1);
                    }

                    if agents.len() != ids.len() {
                        eprintln!(
                            "Warning: Found {} agents, expected {} (some IDs may be invalid)",
                            agents.len(),
                            ids.len()
                        );
                    }

                    match sync_agents_to_opencode(&agents) {
                        Ok(()) => {
                            println!("\nDone! {} agent(s) synced to opencode.json.", agents.len());
                        }
                        Err(e) => {
                            eprintln!("Error writing opencode.json: {}", e);
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
        Commands::ListAgents => {
            match get_all_agents(&conn) {
                Ok(agents) => {
                    if agents.is_empty() {
                        println!("No agents found.");
                        return true;
                    }

                    println!("{:<36}  {:<10}  {}", "ID", "MODE", "NAME");
                    println!("{}", "-".repeat(70));

                    for agent in agents {
                        println!("{:<36}  {:<10}  {}", agent.id, agent.mode, agent.name);
                    }
                }
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::CreateAgent {
            name,
            mode,
            model,
            prompt,
            prompt_file,
            tools,
            permissions,
            format,
        } => {
            println!("Creating agent '{}'...", name);

            match create_agent_cli(
                &conn,
                &name,
                mode,
                model.as_deref(),
                prompt.as_deref(),
                prompt_file,
                &tools,
                &permissions,
            ) {
                Ok(agent) => {
                    match format {
                        OutputFormat::Json => {
                            print_agent_json(&agent);
                        }
                        OutputFormat::Text => {
                            println!("\n✓ Agent created successfully!");
                            println!("  ID: {}", agent.id);
                            println!("  Name: {}", agent.name);
                            println!("  Mode: {}", agent.mode);
                            if let Some(m) = &agent.model {
                                println!("  Model: {}", m);
                            }
                            if let Some(p) = &agent.prompt_content {
                                println!("  Prompt: {} characters", p.len());
                            }
                            if let Some(t) = &agent.tools_config {
                                if let Ok(tools_json) = serde_json::from_str::<Value>(t) {
                                    if let Some(obj) = tools_json.as_object() {
                                        println!("  Tools: {} configured", obj.len());
                                    }
                                }
                            }
                            if let Some(p) = &agent.permissions_config {
                                if let Ok(perms_json) = serde_json::from_str::<Value>(p) {
                                    if let Some(obj) = perms_json.as_object() {
                                        println!("  Permissions: {} configured", obj.len());
                                    }
                                }
                            }
                            println!("\nTo sync to opencode.json, run:");
                            println!("  promption sync-agents --ids={}", agent.id);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to create agent: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::GetAgent { id, format } => {
            match get_agent_by_id_or_name(&conn, &id) {
                Ok(Some(agent)) => match format {
                    OutputFormat::Json => {
                        print_agent_json(&agent);
                    }
                    OutputFormat::Text => {
                        println!("Agent: {}", agent.name);
                        println!("  ID: {}", agent.id);
                        println!("  Mode: {}", agent.mode);
                        if let Some(m) = &agent.model {
                            println!("  Model: {}", m);
                        }
                        if let Some(p) = &agent.prompt_content {
                            println!("  Prompt: {} characters", p.len());
                        }
                        if let Some(t) = &agent.tools_config {
                            if let Ok(tools_json) = serde_json::from_str::<Value>(t) {
                                println!("  Tools: {}", serde_json::to_string_pretty(&tools_json).unwrap());
                            }
                        }
                        if let Some(p) = &agent.permissions_config {
                            if let Ok(perms_json) = serde_json::from_str::<Value>(p) {
                                println!("  Permissions: {}", serde_json::to_string_pretty(&perms_json).unwrap());
                            }
                        }
                    }
                },
                Ok(None) => {
                    eprintln!("Agent '{}' not found", id);
                    std::process::exit(1);
                }
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::UpdateAgent {
            id,
            name,
            mode,
            model,
            clear_model,
            prompt,
            prompt_file,
            clear_prompt,
            tools,
            clear_tools,
            permissions,
            clear_permissions,
        } => {
            println!("Updating agent '{}'...", id);

            match update_agent_cli(
                &conn,
                &id,
                name.as_deref(),
                mode,
                model.as_deref(),
                clear_model,
                prompt.as_deref(),
                prompt_file,
                clear_prompt,
                &tools,
                clear_tools,
                &permissions,
                clear_permissions,
            ) {
                Ok(()) => {
                    println!("✓ Agent updated successfully!");
                }
                Err(e) => {
                    eprintln!("Failed to update agent: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::DeleteAgent { id } => {
            match delete_agent_cli(&conn, &id) {
                Ok(()) => {
                    println!("✓ Agent '{}' deleted successfully", id);
                }
                Err(e) => {
                    eprintln!("Failed to delete agent: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }

    true
}

fn get_agents_by_ids(conn: &Connection, ids: &[String]) -> SqliteResult<Vec<Agent>> {
    if ids.is_empty() {
        return Ok(vec![]);
    }

    let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();
    let query = format!(
        "SELECT id, name, mode, model, prompt_content, tools_config, permissions_config FROM agents WHERE id IN ({})",
        placeholders.join(", ")
    );

    let mut stmt = conn.prepare(&query)?;
    let params: Vec<&dyn rusqlite::ToSql> = ids.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let agents = stmt.query_map(params.as_slice(), |row| {
        Ok(Agent {
            id: row.get(0)?,
            name: row.get(1)?,
            mode: row.get(2)?,
            model: row.get(3)?,
            prompt_content: row.get(4)?,
            tools_config: row.get(5)?,
            permissions_config: row.get(6)?,
        })
    })?;

    agents.collect()
}

fn get_all_agents(conn: &Connection) -> SqliteResult<Vec<Agent>> {
    let query = "SELECT id, name, mode, model, prompt_content, tools_config, permissions_config FROM agents ORDER BY updated_at DESC";
    let mut stmt = conn.prepare(query)?;

    let agents = stmt.query_map([], |row| {
        Ok(Agent {
            id: row.get(0)?,
            name: row.get(1)?,
            mode: row.get(2)?,
            model: row.get(3)?,
            prompt_content: row.get(4)?,
            tools_config: row.get(5)?,
            permissions_config: row.get(6)?,
        })
    })?;

    agents.collect()
}

fn get_agent_by_id_or_name(conn: &Connection, id_or_name: &str) -> SqliteResult<Option<Agent>> {
    // Try by ID first
    let query = "SELECT id, name, mode, model, prompt_content, tools_config, permissions_config FROM agents WHERE id = ? OR name = ?";
    let mut stmt = conn.prepare(query)?;
    
    let mut agents = stmt.query_map([id_or_name, id_or_name], |row| {
        Ok(Agent {
            id: row.get(0)?,
            name: row.get(1)?,
            mode: row.get(2)?,
            model: row.get(3)?,
            prompt_content: row.get(4)?,
            tools_config: row.get(5)?,
            permissions_config: row.get(6)?,
        })
    })?;

    agents.next().transpose()
}

fn create_agent_cli(
    conn: &Connection,
    name: &str,
    mode: AgentModeArg,
    model: Option<&str>,
    prompt: Option<&str>,
    prompt_file: bool,
    tools: &[String],
    permissions: &[String],
) -> SqliteResult<Agent> {
    // Validate name
    if let Err(e) = validate_agent_name(name) {
        eprintln!("Error: {}", e);
        return Err(rusqlite::Error::InvalidQuery);
    }

    // Check if agent with this name already exists
    let existing = get_agent_by_id_or_name(conn, name)?;
    if existing.is_some() {
        eprintln!("Error: Agent with name '{}' already exists", name);
        return Err(rusqlite::Error::InvalidQuery);
    }

    // Generate ID
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // Read prompt if file
    let prompt_content = if prompt_file {
        if let Some(path) = prompt {
            match fs::read_to_string(path) {
                Ok(content) => Some(content),
                Err(e) => {
                    eprintln!("Error reading prompt file '{}': {}", path, e);
                    return Err(rusqlite::Error::InvalidQuery);
                }
            }
        } else {
            None
        }
    } else {
        prompt.map(String::from)
    };

    // Parse tools and permissions
    let tools_config = parse_tools(tools)?;
    let permissions_config = parse_permissions(permissions)?;

    // Insert into database
    conn.execute(
        "INSERT INTO agents (id, name, mode, model, prompt_content, tools_config, permissions_config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            id,
            name,
            mode.as_str(),
            model,
            prompt_content,
            tools_config,
            permissions_config,
            now,
            now,
        ],
    )?;

    Ok(Agent {
        id,
        name: name.to_string(),
        mode: mode.as_str().to_string(),
        model: model.map(String::from),
        prompt_content,
        tools_config,
        permissions_config,
    })
}

fn update_agent_cli(
    conn: &Connection,
    id: &str,
    name: Option<&str>,
    mode: Option<AgentModeArg>,
    model: Option<&str>,
    clear_model: bool,
    prompt: Option<&str>,
    prompt_file: bool,
    clear_prompt: bool,
    tools: &[String],
    clear_tools: bool,
    permissions: &[String],
    clear_permissions: bool,
) -> SqliteResult<()> {
    // Verify agent exists
    let agent = get_agent_by_id_or_name(conn, id)?;
    if agent.is_none() {
        eprintln!("Error: Agent '{}' not found", id);
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }
    let agent = agent.unwrap();

    // Validate name if provided
    if let Some(new_name) = name {
        if let Err(e) = validate_agent_name(new_name) {
            eprintln!("Error: {}", e);
            return Err(rusqlite::Error::InvalidQuery);
        }
    }

    let now = chrono::Utc::now().to_rfc3339();
    let mut updates = vec!["updated_at = ?".to_string()];
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now)];

    // Name update
    if let Some(new_name) = name {
        updates.push("name = ?".to_string());
        params.push(Box::new(new_name.to_string()));
    }

    // Mode update
    if let Some(new_mode) = mode {
        updates.push("mode = ?".to_string());
        params.push(Box::new(new_mode.as_str().to_string()));
    }

    // Model update
    if clear_model {
        updates.push("model = NULL".to_string());
    } else if let Some(new_model) = model {
        updates.push("model = ?".to_string());
        params.push(Box::new(new_model.to_string()));
    }

    // Prompt update
    if clear_prompt {
        updates.push("prompt_content = NULL".to_string());
    } else if let Some(prompt_val) = prompt {
        let prompt_content = if prompt_file {
            match fs::read_to_string(prompt_val) {
                Ok(content) => content,
                Err(e) => {
                    eprintln!("Error reading prompt file '{}': {}", prompt_val, e);
                    return Err(rusqlite::Error::InvalidQuery);
                }
            }
        } else {
            prompt_val.to_string()
        };
        updates.push("prompt_content = ?".to_string());
        params.push(Box::new(prompt_content));
    }

    // Tools update
    if clear_tools {
        updates.push("tools_config = NULL".to_string());
    } else if !tools.is_empty() {
        let tools_config = parse_tools(tools)?;
        updates.push("tools_config = ?".to_string());
        params.push(Box::new(tools_config));
    }

    // Permissions update
    if clear_permissions {
        updates.push("permissions_config = NULL".to_string());
    } else if !permissions.is_empty() {
        let permissions_config = parse_permissions(permissions)?;
        updates.push("permissions_config = ?".to_string());
        params.push(Box::new(permissions_config));
    }

    // Add agent ID as last parameter
    params.push(Box::new(agent.id.clone()));

    let sql = format!("UPDATE agents SET {} WHERE id = ?", updates.join(", "));
    
    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();
    conn.execute(&sql, params_refs.as_slice())?;

    Ok(())
}

fn delete_agent_cli(conn: &Connection, id_or_name: &str) -> SqliteResult<()> {
    let agent = get_agent_by_id_or_name(conn, id_or_name)?;
    if agent.is_none() {
        eprintln!("Error: Agent '{}' not found", id_or_name);
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }
    let agent = agent.unwrap();

    conn.execute("DELETE FROM agents WHERE id = ?", [&agent.id])?;
    Ok(())
}

fn print_agent_json(agent: &Agent) {
    let mut json_obj = serde_json::Map::new();
    json_obj.insert("id".to_string(), json!(agent.id));
    json_obj.insert("name".to_string(), json!(agent.name));
    json_obj.insert("mode".to_string(), json!(agent.mode));
    
    if let Some(model) = &agent.model {
        json_obj.insert("model".to_string(), json!(model));
    }
    
    if let Some(prompt) = &agent.prompt_content {
        json_obj.insert("prompt_content".to_string(), json!(prompt));
    }
    
    if let Some(tools) = &agent.tools_config {
        if let Ok(tools_json) = serde_json::from_str::<Value>(tools) {
            json_obj.insert("tools_config".to_string(), tools_json);
        }
    }
    
    if let Some(perms) = &agent.permissions_config {
        if let Ok(perms_json) = serde_json::from_str::<Value>(perms) {
            json_obj.insert("permissions_config".to_string(), perms_json);
        }
    }
    
    println!("{}", serde_json::to_string_pretty(&json_obj).unwrap());
}

fn sync_agents_to_opencode(agents: &[Agent]) -> std::io::Result<()> {
    let config_path = PathBuf::from("opencode.json");

    // Read existing config or create new
    let mut config: Value = if config_path.exists() {
        let content = fs::read_to_string(&config_path)?;
        serde_json::from_str(&content).unwrap_or_else(|_| {
            json!({
                "$schema": "https://opencode.ai/config.json"
            })
        })
    } else {
        json!({
            "$schema": "https://opencode.ai/config.json"
        })
    };

    // Ensure agent object exists
    if !config.is_object() {
        config = json!({
            "$schema": "https://opencode.ai/config.json",
            "agent": {}
        });
    }
    if config.get("agent").is_none() {
        config["agent"] = json!({});
    }

    // Add/update each agent
    for agent in agents {
        let mut agent_config = json!({
            "mode": agent.mode
        });

        if let Some(model) = &agent.model {
            agent_config["model"] = json!(model);
        }

        if let Some(prompt) = &agent.prompt_content {
            // Save prompt to file
            let prompt_path = PathBuf::from(format!(".opencode/prompts/{}.txt", agent.name));
            if let Some(parent) = prompt_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&prompt_path, prompt)?;
            agent_config["prompt"] = json!(format!("{{file:{}}}", prompt_path.display()));
            println!("  + Saved prompt to {}", prompt_path.display());
        }

        if let Some(tools_json) = &agent.tools_config {
            if let Ok(tools) = serde_json::from_str::<Value>(tools_json) {
                agent_config["tools"] = tools;
            }
        }

        if let Some(perms_json) = &agent.permissions_config {
            if let Ok(perms) = serde_json::from_str::<Value>(perms_json) {
                agent_config["permissions"] = perms;
            }
        }

        config["agent"][&agent.name] = agent_config;
        println!("  + Added agent config: {}", agent.name);
    }

    // Write back to opencode.json
    let pretty_json = serde_json::to_string_pretty(&config)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    fs::write(&config_path, pretty_json)?;
    println!("  + Updated opencode.json");

    Ok(())
}
