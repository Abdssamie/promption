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
 * - Ctrl/Cmd + A: Select all visible items
 * - Ctrl/Cmd + D: Deselect all
 * - Ctrl/Cmd + C: Copy command (if items selected)
 * - Ctrl/Cmd + F: Focus search bar
 * - Escape: Close dialog / Deselect all
 */
export function useKeyboardShortcuts() {
    const setCreating = useAppStore((s) => s.setCreating);
    const selectAll = useAppStore((s) => s.selectAll);
    const deselectAll = useAppStore((s) => s.deselectAll);
    const selectedItems = useAppStore((s) => s.selectedItems);
    const getSelectedItemsData = useAppStore((s) => s.getSelectedItemsData);
    const editingItem = useAppStore((s) => s.editingItem);
    const isCreating = useAppStore((s) => s.isCreating);
    const setEditing = useAppStore((s) => s.setEditing);

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
                if (editingItem || isCreating) {
                    e.preventDefault();
                    setEditing(null);
                    setCreating(false);
                }
            }
            return;
        }

        // Escape - close dialogs or deselect all
        if (e.key === 'Escape') {
            e.preventDefault();
            if (editingItem || isCreating) {
                setEditing(null);
                setCreating(false);
            } else if (selectedItems.size > 0) {
                deselectAll();
            }
            return;
        }

        // Ctrl/Cmd + N - New item (default: skill)
        if (isMod && !isShift && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            handleCreateItem('skill');
            return;
        }

        // Ctrl/Cmd + Shift + S - Create skill
        if (isMod && isShift && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleCreateItem('skill');
            return;
        }

        // Ctrl/Cmd + Shift + R - Create rule
        if (isMod && isShift && e.key.toLowerCase() === 'r') {
            e.preventDefault();
            handleCreateItem('rule');
            return;
        }

        // Ctrl/Cmd + Shift + W - Create workflow
        if (isMod && isShift && e.key.toLowerCase() === 'w') {
            e.preventDefault();
            handleCreateItem('workflow');
            return;
        }

        // Ctrl/Cmd + A - Select all
        if (isMod && !isShift && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            selectAll();
            return;
        }

        // Ctrl/Cmd + D - Deselect all
        if (isMod && !isShift && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            deselectAll();
            return;
        }

        // Ctrl/Cmd + C - Copy command (if items selected, otherwise let browser handle)
        if (isMod && !isShift && e.key.toLowerCase() === 'c') {
            if (selectedItems.size > 0) {
                e.preventDefault();
                handleCopyCommand();
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
        editingItem,
        isCreating,
        selectedItems,
        setEditing,
        setCreating,
        deselectAll,
        selectAll,
        handleCreateItem,
        handleCopyCommand,
        focusSearchBar,
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}
