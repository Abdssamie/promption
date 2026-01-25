import { create } from 'zustand';
import type { Item, Tag, ItemType, ItemFormData } from '../types';
import * as db from '../services/database';

interface AppState {
    // Data
    items: Item[];
    tags: Tag[];

    // Selection
    selectedItems: Set<string>;

    // Filters
    searchQuery: string;
    typeFilter: ItemType | null;
    tagFilter: string[];

    // UI State
    isLoading: boolean;
    editingItem: Item | null;
    isCreating: boolean;
    createType: ItemType;
}

interface AppActions {
    // Data loading
    loadData: () => Promise<void>;

    // Items CRUD
    createItem: (data: ItemFormData) => Promise<Item>;
    updateItem: (id: string, data: Partial<ItemFormData>) => Promise<Item>;
    deleteItem: (id: string) => Promise<void>;

    // Tags CRUD
    createTag: (name: string, color: string) => Promise<Tag>;
    updateTag: (id: string, name: string, color: string) => Promise<Tag>;
    deleteTag: (id: string) => Promise<void>;

    // Selection
    toggleSelect: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;

    // Filters
    setSearch: (query: string) => void;
    setTypeFilter: (type: ItemType | null) => void;
    setTagFilter: (tagIds: string[]) => void;

    // UI
    setEditing: (item: Item | null) => void;
    setCreating: (isCreating: boolean, type?: ItemType) => void;

    // Computed (kept for backward compatibility but deprecated)
    getFilteredItems: () => Item[];
    getSelectedItemsData: () => Item[];
}

interface AppComputed {
    // Reactive computed values
    filteredItems: Item[];
}

// Helper function to compute filtered items
const computeFilteredItems = (state: AppState): Item[] => {
    const { items, searchQuery, typeFilter, tagFilter } = state;
    let filtered = items;

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.content.toLowerCase().includes(query)
        );
    }

    if (typeFilter) {
        filtered = filtered.filter((item) => item.item_type === typeFilter);
    }

    if (tagFilter.length > 0) {
        filtered = filtered.filter((item) =>
            tagFilter.some((tagId) => item.tags.some((t) => t.id === tagId))
        );
    }

    return filtered;
};

export const useAppStore = create<AppState & AppActions & AppComputed>((set, get) => ({
    // Initial state
    items: [],
    tags: [],
    selectedItems: new Set(),
    searchQuery: '',
    typeFilter: null,
    tagFilter: [],
    isLoading: true,
    editingItem: null,
    isCreating: false,
    createType: 'skill',
    filteredItems: [],

    // Data loading
    loadData: async () => {
        set({ isLoading: true });
        try {
            const [items, tags] = await Promise.all([db.getAllItems(), db.getAllTags()]);
            const state = get();
            const filteredItems = computeFilteredItems({ ...state, items, tags });
            set({ items, tags, filteredItems, isLoading: false });
        } catch (error) {
            console.error('Failed to load data:', error);
            set({ isLoading: false });
        }
    },

    // Items CRUD
    createItem: async (data) => {
        try {
            const item = await db.createItem(data);
            set((state) => {
                const items = [item, ...state.items];
                const filteredItems = computeFilteredItems({ ...state, items });
                return { items, filteredItems };
            });
            console.log('Item created successfully:', item.id);
            return item;
        } catch (error) {
            console.error('Failed to create item:', error);
            throw error;
        }
    },

    updateItem: async (id, data) => {
        try {
            const item = await db.updateItem(id, data);
            set((state) => {
                const items = state.items.map((i) => (i.id === id ? item : i));
                const filteredItems = computeFilteredItems({ ...state, items });
                return {
                    items,
                    filteredItems,
                    editingItem: state.editingItem?.id === id ? item : state.editingItem,
                };
            });
            console.log('Item updated successfully:', item.id);
            return item;
        } catch (error) {
            console.error('Failed to update item:', error);
            throw error;
        }
    },

    deleteItem: async (id) => {
        try {
            await db.deleteItem(id);
            set((state) => {
                const newSelected = new Set(state.selectedItems);
                newSelected.delete(id);
                const items = state.items.filter((i) => i.id !== id);
                const filteredItems = computeFilteredItems({ ...state, items });
                return {
                    items,
                    filteredItems,
                    selectedItems: newSelected,
                    editingItem: state.editingItem?.id === id ? null : state.editingItem,
                };
            });
            console.log('Item deleted successfully:', id);
        } catch (error) {
            console.error('Failed to delete item:', error);
            throw error;
        }
    },

    // Tags CRUD
    createTag: async (name, color) => {
        try {
            const tag = await db.createTag(name, color);
            set((state) => ({ tags: [...state.tags, tag] }));
            console.log('Tag created successfully:', tag.id);
            return tag;
        } catch (error) {
            console.error('Failed to create tag:', error);
            throw error;
        }
    },

    updateTag: async (id, name, color) => {
        try {
            const tag = await db.updateTag(id, name, color);
            set((state) => ({
                tags: state.tags.map((t) => (t.id === id ? tag : t)),
            }));
            console.log('Tag updated successfully:', tag.id);
            return tag;
        } catch (error) {
            console.error('Failed to update tag:', error);
            throw error;
        }
    },

    deleteTag: async (id) => {
        try {
            await db.deleteTag(id);
            set((state) => {
                const tagFilter = state.tagFilter.filter((tid) => tid !== id);
                const tags = state.tags.filter((t) => t.id !== id);
                const filteredItems = computeFilteredItems({ ...state, tags, tagFilter });
                return { tags, tagFilter, filteredItems };
            });
            console.log('Tag deleted successfully:', id);
        } catch (error) {
            console.error('Failed to delete tag:', error);
            throw error;
        }
    },

    // Selection
    toggleSelect: (id) => {
        set((state) => {
            const newSelected = new Set(state.selectedItems);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return { selectedItems: newSelected };
        });
    },

    selectAll: () => {
        const { filteredItems } = get();
        set({ selectedItems: new Set(filteredItems.map((i) => i.id)) });
    },

    deselectAll: () => {
        set({ selectedItems: new Set() });
    },

    // Filters
    setSearch: (query) => {
        set((state) => {
            const searchQuery = query;
            const filteredItems = computeFilteredItems({ ...state, searchQuery });
            return { searchQuery, filteredItems };
        });
    },
    setTypeFilter: (type) => {
        set((state) => {
            const typeFilter = type;
            const filteredItems = computeFilteredItems({ ...state, typeFilter });
            return { typeFilter, filteredItems };
        });
    },
    setTagFilter: (tagIds) => {
        set((state) => {
            const tagFilter = tagIds;
            const filteredItems = computeFilteredItems({ ...state, tagFilter });
            return { tagFilter, filteredItems };
        });
    },

    // UI
    setEditing: (item) => set({ editingItem: item }),
    setCreating: (isCreating, type) =>
        set((state) => ({
            isCreating,
            createType: type ?? state.createType,
        })),

    // Computed (kept for backward compatibility)
    getFilteredItems: () => {
        return get().filteredItems;
    },

    getSelectedItemsData: () => {
        const { items, selectedItems } = get();
        return items.filter((item) => selectedItems.has(item.id));
    },
}));
