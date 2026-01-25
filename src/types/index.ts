export type ItemType = 'skill' | 'rule' | 'workflow';

export interface Tag {
    id: string;
    name: string;
    color: string;
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
