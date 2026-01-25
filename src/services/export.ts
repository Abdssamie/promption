import { mkdir, exists, writeTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import type { Item } from '../types';

function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function exportItems(items: Item[]): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
        // Ask user to select a directory
        const selectedPath = await open({
            directory: true,
            multiple: false,
            title: 'Select export directory',
        });

        if (!selectedPath) {
            return { success: false, error: 'No directory selected' };
        }

        const basePath = typeof selectedPath === 'string' ? selectedPath : selectedPath[0];
        const agentPath = `${basePath}/.agent`;

        // Create .agent directory structure
        const skillsPath = `${agentPath}/skills`;
        const rulesPath = `${agentPath}/rules`;
        const workflowsPath = `${agentPath}/workflows`;

        // Create directories if they don't exist
        for (const dirPath of [agentPath, skillsPath, rulesPath, workflowsPath]) {
            const dirExists = await exists(dirPath);
            if (!dirExists) {
                await mkdir(dirPath, { recursive: true });
            }
        }

        // Export each item (content is exported as-is, user is responsible for proper format)
        for (const item of items) {
            const slug = slugify(item.name);

            switch (item.item_type) {
                case 'skill': {
                    // Skills go in their own directory with SKILL.md
                    const skillDir = `${skillsPath}/${slug}`;
                    const skillDirExists = await exists(skillDir);
                    if (!skillDirExists) {
                        await mkdir(skillDir, { recursive: true });
                    }
                    const filePath = `${skillDir}/SKILL.md`;
                    await writeTextFile(filePath, item.content);
                    break;
                }
                case 'rule': {
                    // Rules are single .md files
                    const filePath = `${rulesPath}/${slug}.md`;
                    await writeTextFile(filePath, item.content);
                    break;
                }
                case 'workflow': {
                    // Workflows are single .md files
                    const filePath = `${workflowsPath}/${slug}.md`;
                    await writeTextFile(filePath, item.content);
                    break;
                }
            }
        }

        return { success: true, path: agentPath };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: String(error) };
    }
}
