import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { ItemType } from '../types';

/**
 * Global keyboard shortcuts hook
 * 
 * Shortcuts:
 * - Ctrl/Cmd + N: Open create dialog (default: skill)
 * - Ctrl/Cmd + Shift + S: Create skill
 * - Ctrl/Cmd + Shift + R: Create rule
 * - Ctrl/Cmd + Shift + W: Create workflow
 * - Ctrl/Cmd + A: Select all (items or agents based on view)
 * - Ctrl/Cmd + D: Deselect all
 * - Ctrl/Cmd + C: Copy command (if items selected)
 * - Ctrl/Cmd + E: Export agents (if agents selected)
 * - Ctrl/Cmd + F: Focus search bar
 * - Escape: Close dialog / Deselect all
 */
export function useKeyboardShortcuts() {
    const viewMode = useAppStore((s) => s.viewMode);
    const setCreating = useAppStore((s) => s.setCreating);
    const selectAll = useAppStore((s) => s.selectAll);
    const deselectAll = useAppStore((s) => s.deselectAll);
    const selectAllAgents = useAppStore((s) => s.selectAllAgents);
    const deselectAllAgents = useAppStore((s) => s.deselectAllAgents);
    const selectedItems = useAppStore((s) => s.selectedItems);
    const selectedAgents = useAppStore((s) => s.selectedAgents);
    const getSelectedItemsData = useAppStore((s) => s.getSelectedItemsData);
    const getSelectedAgentsData = useAppStore((s) => s.getSelectedAgentsData);
    const editingItem = useAppStore((s) => s.editingItem);
    const editingAgent = useAppStore((s) => s.editingAgent);
    const isCreating = useAppStore((s) => s.isCreating);
    const setEditing = useAppStore((s) => s.setEditing);
    const setEditingAgent = useAppStore((s) => s.setEditingAgent);

    const handleCopyCommand = useCallback(async () => {
        const itemsToExport = getSelectedItemsData();
        if (itemsToExport.length === 0) return;

        const ids = itemsToExport.map((item) => item.id).join(',');
        const command = `promption sync --ids=${ids}`;
        
        try {
            await navigator.clipboard.writeText(command);
            console.log('Command copied to clipboard');
        } catch (error) {
            console.error('Failed to copy command:', error);
        }
    }, [getSelectedItemsData]);

    const handleExportAgents = useCallback(async () => {
        const agentsToExport = getSelectedAgentsData();
        if (agentsToExport.length === 0) return;

        const ids = agentsToExport.map((agent) => agent.id).join(',');
        const command = `promption sync-agents --ids=${ids}`;
        
        try {
            await navigator.clipboard.writeText(command);
            console.log('Agent export command copied to clipboard');
        } catch (error) {
            console.error('Failed to copy agent export command:', error);
        }
    }, [getSelectedAgentsData]);

    const handleCreateItem = useCallback((type: ItemType) => {
        setCreating(true, type);
    }, [setCreating]);

    const focusSearchBar = useCallback(() => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const isMod = e.metaKey || e.ctrlKey;
        const isShift = e.shiftKey;
        const target = e.target as HTMLElement;
        const isInputActive = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        
        // Don't intercept if we're in an input field (except for specific shortcuts)
        if (isInputActive) {
            // Escape should still work in inputs to close dialogs
            if (e.key === 'Escape') {
                if (editingItem || editingAgent || isCreating) {
                    e.preventDefault();
                    setEditing(null);
                    setEditingAgent(null);
                    setCreating(false);
                }
            }
            return;
        }

        // Escape - close dialogs or deselect all
        if (e.key === 'Escape') {
            e.preventDefault();
            if (editingItem || editingAgent || isCreating) {
                setEditing(null);
                setEditingAgent(null);
                setCreating(false);
            } else if (viewMode === 'agents' && selectedAgents.size > 0) {
                deselectAllAgents();
            } else if (selectedItems.size > 0) {
                deselectAll();
            }
            return;
        }

        // Ctrl/Cmd + N - New item (default: skill) - only in items view
        if (isMod && !isShift && e.key.toLowerCase() === 'n' && viewMode === 'items') {
            e.preventDefault();
            handleCreateItem('skill');
            return;
        }

        // Ctrl/Cmd + Shift + S - Create skill - only in items view
        if (isMod && isShift && e.key.toLowerCase() === 's' && viewMode === 'items') {
            e.preventDefault();
            handleCreateItem('skill');
            return;
        }

        // Ctrl/Cmd + Shift + R - Create rule - only in items view
        if (isMod && isShift && e.key.toLowerCase() === 'r' && viewMode === 'items') {
            e.preventDefault();
            handleCreateItem('rule');
            return;
        }

        // Ctrl/Cmd + Shift + W - Create workflow - only in items view
        if (isMod && isShift && e.key.toLowerCase() === 'w' && viewMode === 'items') {
            e.preventDefault();
            handleCreateItem('workflow');
            return;
        }

        // Ctrl/Cmd + A - Select all (respects current view)
        if (isMod && !isShift && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            if (viewMode === 'agents') {
                selectAllAgents();
            } else {
                selectAll();
            }
            return;
        }

        // Ctrl/Cmd + D - Deselect all (respects current view)
        if (isMod && !isShift && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            if (viewMode === 'agents') {
                deselectAllAgents();
            } else {
                deselectAll();
            }
            return;
        }

        // Ctrl/Cmd + C - Copy command (if items selected in items view)
        if (isMod && !isShift && e.key.toLowerCase() === 'c' && viewMode === 'items') {
            if (selectedItems.size > 0) {
                e.preventDefault();
                handleCopyCommand();
            }
            return;
        }

        // Ctrl/Cmd + E - Export agents (if agents selected in agents view)
        if (isMod && !isShift && e.key.toLowerCase() === 'e' && viewMode === 'agents') {
            if (selectedAgents.size > 0) {
                e.preventDefault();
                handleExportAgents();
            }
            return;
        }

        // Ctrl/Cmd + F - Focus search
        if (isMod && !isShift && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            focusSearchBar();
            return;
        }
    }, [
        viewMode,
        editingItem,
        editingAgent,
        isCreating,
        selectedItems,
        selectedAgents,
        setEditing,
        setEditingAgent,
        setCreating,
        deselectAll,
        deselectAllAgents,
        selectAll,
        selectAllAgents,
        handleCreateItem,
        handleCopyCommand,
        handleExportAgents,
        focusSearchBar,
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
