export type ItemType = 'skill' | 'rule' | 'workflow';

export interface Tag {
    id: string;
    name: string;
    color: string;
    is_system: boolean; // System tags cannot be deleted
    iconSlug?: string; // Optional icon slug for technology tags
}

export interface Item {
    id: string;
    name: string;
    content: string;
    item_type: ItemType;
    created_at: string;
    updated_at: string;
    tags: Tag[];
}

export interface ItemFormData {
    name: string;
    content: string;
    item_type: ItemType;
    tag_ids: string[];
}

export interface ExportItem {
    id: string;
    name: string;
    item_type: ItemType;
}

export type ViewMode = 'list' | 'grid';
export type EditMode = 'view' | 'edit';

export type AgentMode = 'primary' | 'subagent';

export interface Agent {
    id: string;
    name: string;
    mode: AgentMode;
    model?: string;
    prompt_content?: string;
    tools_config?: Record<string, boolean | string>;
    permissions_config?: Record<string, 'ask' | 'allow' | 'deny'>;
    created_at: string;
    updated_at: string;
}

export interface AgentFormData {
    name: string;
    mode: AgentMode;
    model?: string;
    prompt_content?: string;
    tools_config?: Record<string, boolean | string>;
    permissions_config?: Record<string, 'ask' | 'allow' | 'deny'>;
}
