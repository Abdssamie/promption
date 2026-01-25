import Database from '@tauri-apps/plugin-sql';
import { v4 as uuidv4 } from 'uuid';
import type { Item, Tag, ItemType, ItemFormData } from '../types';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
    if (!db) {
        try {
            db = await Database.load('sqlite:promption.db');
            console.log('Database connection established');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            throw error;
        }
    }
    return db;
}

// Items CRUD
export async function getAllItems(): Promise<Item[]> {
    const database = await getDb();

    try {
        const items = await database.select<Array<{
            id: string;
            name: string;
            content: string;
            item_type: ItemType;
            created_at: string;
            updated_at: string;
        }>>('SELECT * FROM items ORDER BY updated_at DESC');

        const itemsWithTags: Item[] = [];

        for (const item of items) {
            const tags = await getItemTags(item.id);
            itemsWithTags.push({ ...item, tags });
        }

        console.log(`Loaded ${itemsWithTags.length} items from database`);
        return itemsWithTags;
    } catch (error) {
        console.error('Failed to get all items:', error);
        throw error;
    }
}

export async function getItemById(id: string): Promise<Item | null> {
    const database = await getDb();
    const items = await database.select<Array<{
        id: string;
        name: string;
        content: string;
        item_type: ItemType;
        created_at: string;
        updated_at: string;
    }>>('SELECT * FROM items WHERE id = $1', [id]);

    if (items.length === 0) return null;

    const tags = await getItemTags(id);
    return { ...items[0], tags };
}

export async function createItem(data: ItemFormData): Promise<Item> {
    const database = await getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
        await database.execute(
            'INSERT INTO items (id, name, content, item_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, data.name, data.content, data.item_type, now, now]
        );
        console.log(`Item created: ${id}, adding ${data.tag_ids.length} tags`);

        // Add tags
        for (const tagId of data.tag_ids) {
            try {
                await database.execute(
                    'INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES ($1, $2)',
                    [id, tagId]
                );
                console.log(`Tag ${tagId} linked to item ${id}`);
            } catch (tagError) {
                console.error(`Failed to link tag ${tagId} to item ${id}:`, tagError);
            }
        }

        const item = await getItemById(id);
        if (!item) {
            throw new Error('Failed to retrieve created item');
        }
        return item;
    } catch (error) {
        console.error('Failed to create item:', error);
        throw error;
    }
}

export async function updateItem(id: string, data: Partial<ItemFormData>): Promise<Item> {
    const database = await getDb();
    const now = new Date().toISOString();

    try {
        if (data.name !== undefined || data.content !== undefined || data.item_type !== undefined) {
            const updates: string[] = ['updated_at = $1'];
            const values: (string | undefined)[] = [now];
            let paramIndex = 2;

            if (data.name !== undefined) {
                updates.push(`name = $${paramIndex++}`);
                values.push(data.name);
            }
            if (data.content !== undefined) {
                updates.push(`content = $${paramIndex++}`);
                values.push(data.content);
            }
            if (data.item_type !== undefined) {
                updates.push(`item_type = $${paramIndex++}`);
                values.push(data.item_type);
            }

            values.push(id);
            await database.execute(
                `UPDATE items SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
                values
            );
        }

        if (data.tag_ids !== undefined) {
            console.log(`Updating tags for item ${id}: ${data.tag_ids.length} tags`);
            // Remove existing tags
            await database.execute('DELETE FROM item_tags WHERE item_id = $1', [id]);
            // Add new tags
            for (const tagId of data.tag_ids) {
                try {
                    await database.execute(
                        'INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES ($1, $2)',
                        [id, tagId]
                    );
                    console.log(`Tag ${tagId} linked to item ${id}`);
                } catch (tagError) {
                    console.error(`Failed to link tag ${tagId} to item ${id}:`, tagError);
                }
            }
        }

        const item = await getItemById(id);
        if (!item) {
            throw new Error('Failed to retrieve updated item');
        }
        return item;
    } catch (error) {
        console.error('Failed to update item:', error);
        throw error;
    }
}

export async function deleteItem(id: string): Promise<void> {
    const database = await getDb();
    try {
        await database.execute('DELETE FROM items WHERE id = $1', [id]);
        console.log(`Item deleted: ${id}`);
    } catch (error) {
        console.error('Failed to delete item:', error);
        throw error;
    }
}

// Tags CRUD
export async function getAllTags(): Promise<Tag[]> {
    const database = await getDb();
    try {
        const tags = await database.select<Tag[]>('SELECT * FROM tags ORDER BY name');
        console.log(`Loaded ${tags.length} tags from database`);
        return tags;
    } catch (error) {
        console.error('Failed to get all tags:', error);
        throw error;
    }
}

export async function getItemTags(itemId: string): Promise<Tag[]> {
    const database = await getDb();
    return database.select<Tag[]>(
        `SELECT t.* FROM tags t 
     INNER JOIN item_tags it ON t.id = it.tag_id 
     WHERE it.item_id = $1`,
        [itemId]
    );
}

export async function createTag(name: string, color: string): Promise<Tag> {
    const database = await getDb();
    const id = uuidv4();

    await database.execute(
        'INSERT INTO tags (id, name, color) VALUES ($1, $2, $3)',
        [id, name, color]
    );

    return { id, name, color };
}

export async function updateTag(id: string, name: string, color: string): Promise<Tag> {
    const database = await getDb();
    await database.execute(
        'UPDATE tags SET name = $1, color = $2 WHERE id = $3',
        [name, color, id]
    );
    return { id, name, color };
}

export async function deleteTag(id: string): Promise<void> {
    const database = await getDb();
    await database.execute('DELETE FROM tags WHERE id = $1', [id]);
}

// Search
export async function searchItems(query: string, typeFilter?: ItemType, tagIds?: string[]): Promise<Item[]> {
    const database = await getDb();

    let sql = 'SELECT DISTINCT i.* FROM items i';
    const params: string[] = [];
    let paramIndex = 1;

    if (tagIds && tagIds.length > 0) {
        sql += ' INNER JOIN item_tags it ON i.id = it.item_id';
    }

    const conditions: string[] = [];

    if (query) {
        conditions.push(`(i.name LIKE $${paramIndex} OR i.content LIKE $${paramIndex})`);
        params.push(`%${query}%`);
        paramIndex++;
    }

    if (typeFilter) {
        conditions.push(`i.item_type = $${paramIndex}`);
        params.push(typeFilter);
        paramIndex++;
    }

    if (tagIds && tagIds.length > 0) {
        const placeholders = tagIds.map((_, i) => `$${paramIndex + i}`).join(', ');
        conditions.push(`it.tag_id IN (${placeholders})`);
        params.push(...tagIds);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY i.updated_at DESC';

    const items = await database.select<Array<{
        id: string;
        name: string;
        content: string;
        item_type: ItemType;
        created_at: string;
        updated_at: string;
    }>>(sql, params);

    const itemsWithTags: Item[] = [];
    for (const item of items) {
        const tags = await getItemTags(item.id);
        itemsWithTags.push({ ...item, tags });
    }

    return itemsWithTags;
}
