// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Try CLI first - if a command was executed, exit
    if promption_lib::cli::run() {
        return;
    }
    
    // No CLI command, launch the GUI
    promption_lib::run()
}
