import { create } from 'zustand';
import type { Item, Tag, ItemType, ItemFormData, Agent, AgentFormData, ExportAgent } from '../types';
import * as db from '../services/database';

interface AppState {
    // Data
    items: Item[];
    tags: Tag[];
    agents: Agent[];

    // Selection
    selectedItems: Set<string>;
    selectedAgents: Set<string>;

    // Filters
    searchQuery: string;
    typeFilter: ItemType | null;
    tagFilter: string[];

    // UI State
    isLoading: boolean;
    editingItem: Item | null;
    editingAgent: Agent | null;
    isCreating: boolean;
    createType: ItemType;
    viewMode: 'items' | 'agents';
}

interface AppActions {
    // Data loading
    loadData: () => Promise<void>;

    // Items CRUD
    createItem: (data: ItemFormData) => Promise<Item>;
    updateItem: (id: string, data: Partial<ItemFormData>) => Promise<Item>;
    deleteItem: (id: string) => Promise<void>;

    // Agents CRUD
    createAgent: (data: AgentFormData) => Promise<Agent>;
    updateAgent: (id: string, data: Partial<AgentFormData>) => Promise<Agent>;
    deleteAgent: (id: string) => Promise<void>;

    // Tags CRUD
    createTag: (name: string, color: string) => Promise<Tag>;
    updateTag: (id: string, name: string, color: string) => Promise<Tag>;
    deleteTag: (id: string) => Promise<void>;

    // Selection
    toggleSelect: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    toggleSelectAgent: (id: string) => void;
    selectAllAgents: () => void;
    deselectAllAgents: () => void;

    // Filters
    setSearch: (query: string) => void;
    setTypeFilter: (type: ItemType | null) => void;
    setTagFilter: (tagIds: string[]) => void;

    // UI
    setEditing: (item: Item | null) => void;
    setEditingAgent: (agent: Agent | null) => void;
    setCreating: (isCreating: boolean, type?: ItemType) => void;
    setViewMode: (mode: 'items' | 'agents') => void;

    // Computed (kept for backward compatibility but deprecated)
    getFilteredItems: () => Item[];
    getSelectedItemsData: () => Item[];
    getSelectedAgentsData: () => Agent[];
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
    agents: [],
    selectedItems: new Set(),
    selectedAgents: new Set(),
    searchQuery: '',
    typeFilter: null,
    tagFilter: [],
    isLoading: true,
    editingItem: null,
    editingAgent: null,
    isCreating: false,
    createType: 'skill',
    viewMode: 'items',
    filteredItems: [],

    // Data loading
    loadData: async () => {
        set({ isLoading: true });
        try {
            const [items, tags, agents] = await Promise.all([db.getAllItems(), db.getAllTags(), db.getAllAgents()]);
            const state = get();
            const filteredItems = computeFilteredItems({ ...state, items, tags });
            set({ items, tags, agents, filteredItems, isLoading: false });
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
            const message = error instanceof Error ? error.message : 'Failed to create item';
            console.error('Failed to create item:', error);
            throw new Error(message);
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
            const message = error instanceof Error ? error.message : 'Failed to update item';
            console.error('Failed to update item:', error);
            throw new Error(message);
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

    // Agents CRUD
    createAgent: async (data) => {
        try {
            const agent = await db.createAgent(data);
            set((state) => ({
                agents: [agent, ...state.agents],
            }));
            console.log('Agent created successfully:', agent.id);
            return agent;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create agent';
            console.error('Failed to create agent:', error);
            throw new Error(message);
        }
    },

    updateAgent: async (id, data) => {
        try {
            const agent = await db.updateAgent(id, data);
            set((state) => ({
                agents: state.agents.map((a) => (a.id === id ? agent : a)),
                editingAgent: state.editingAgent?.id === id ? agent : state.editingAgent,
            }));
            console.log('Agent updated successfully:', agent.id);
            return agent;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update agent';
            console.error('Failed to update agent:', error);
            throw new Error(message);
        }
    },

    deleteAgent: async (id) => {
        try {
            await db.deleteAgent(id);
            set((state) => ({
                agents: state.agents.filter((a) => a.id !== id),
                editingAgent: state.editingAgent?.id === id ? null : state.editingAgent,
            }));
            console.log('Agent deleted successfully:', id);
        } catch (error) {
            console.error('Failed to delete agent:', error);
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
            const message = error instanceof Error ? error.message : 'Failed to create tag';
            console.error('Failed to create tag:', error);
            throw new Error(message);
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

    // Agent Selection
    toggleSelectAgent: (id) => {
        set((state) => {
            const newSelected = new Set(state.selectedAgents);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return { selectedAgents: newSelected };
        });
    },

    selectAllAgents: () => {
        const { agents } = get();
        set({ selectedAgents: new Set(agents.map((a) => a.id)) });
    },

    deselectAllAgents: () => {
        set({ selectedAgents: new Set() });
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
    setEditingAgent: (agent) => set({ editingAgent: agent }),
    setCreating: (isCreating, type) =>
        set((state) => ({
            isCreating,
            createType: type ?? state.createType,
        })),
    setViewMode: (mode) => set({ viewMode: mode }),

    // Computed (kept for backward compatibility)
    getFilteredItems: () => {
        return get().filteredItems;
    },

    getSelectedItemsData: () => {
        const { items, selectedItems } = get();
        return items.filter((item) => selectedItems.has(item.id));
    },

    getSelectedAgentsData: () => {
        const { agents, selectedAgents } = get();
        return agents.filter((agent) => selectedAgents.has(agent.id));
    },
}));
