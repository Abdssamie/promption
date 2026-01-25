import { Plus, Download, Tags, Trash2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { exportItems } from '../services/export';
import { cn } from '../lib/utils';
import type { ItemType } from '../types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TAG_COLORS } from '../lib/utils';

export function FloatingActions() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const selectedItems = useAppStore((s) => s.selectedItems);
    const getSelectedItemsData = useAppStore((s) => s.getSelectedItemsData);
    const setCreating = useAppStore((s) => s.setCreating);
    const deselectAll = useAppStore((s) => s.deselectAll);

    const handleExport = async () => {
        const itemsToExport = getSelectedItemsData();
        if (itemsToExport.length === 0) {
            setExportMessage({ type: 'error', text: 'Select items to export' });
            setTimeout(() => setExportMessage(null), 3000);
            return;
        }

        setIsExporting(true);
        const result = await exportItems(itemsToExport);
        setIsExporting(false);

        if (result.success) {
            setExportMessage({ type: 'success', text: `Exported to ${result.path}` });
            deselectAll();
        } else {
            setExportMessage({ type: 'error', text: result.error ?? 'Export failed' });
        }
        setTimeout(() => setExportMessage(null), 4000);
    };

    const handleCreateNew = (type: ItemType) => {
        setCreating(true, type);
    };

    return (
        <>
            {/* Export message toast */}
            {exportMessage && (
                <div className="fixed bottom-24 right-6 z-50 animate-fadeIn">
                    <div
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm shadow-lg',
                            exportMessage.type === 'success'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                : 'bg-destructive/20 text-destructive border border-destructive/30'
                        )}
                    >
                        {exportMessage.text}
                    </div>
                </div>
            )}

            {/* Floating action widget */}
            <div className="fixed bottom-6 right-6 z-40">
                <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                    {/* Tag Manager */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Tags size={16} />
                                Tags
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Tags</DialogTitle>
                            </DialogHeader>
                            <TagManagerContent />
                        </DialogContent>
                    </Dialog>

                    {/* Export */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || selectedItems.size === 0}
                        className="gap-2"
                    >
                        <Download size={16} />
                        Export
                    </Button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-border" />

                    {/* Create buttons */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('skill')}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        Skill
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('rule')}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        Rule
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('workflow')}
                        className="gap-2"
                    >
                        <Plus size={16} />
                        Workflow
                    </Button>
                </div>
            </div>
        </>
    );
}

function TagManagerContent() {
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

    const tags = useAppStore((s) => s.tags);
    const createTag = useAppStore((s) => s.createTag);
    const deleteTag = useAppStore((s) => s.deleteTag);

    // Auto-create popular technology tags on first load
    useEffect(() => {
        const initializeTags = async () => {
            // Tags are now initialized in database.ts on first connection
            // This effect is kept for backward compatibility but does nothing
        };
        
        if (tags.length === 0) {
            initializeTags();
        }
    }, []);

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        await createTag(newTagName.trim(), newTagColor);
        setNewTagName('');
        setNewTagColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
    };

    return (
        <div className="space-y-4">
            {/* Create new tag */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium">Create New Tag</h3>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag name..."
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                    />
                    <Button
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                    >
                        Add
                    </Button>
                </div>

                {/* Color picker */}
                <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setNewTagColor(color)}
                            className={cn(
                                'w-6 h-6 rounded-full transition-transform',
                                newTagColor === color && 'scale-110 ring-2 ring-offset-2 ring-offset-background'
                            )}
                            style={{
                                backgroundColor: color,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Existing tags */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Tags ({tags.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No tags yet</p>
                    ) : (
                        tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                            >
                                <div className="flex items-center gap-2">
                                    {tag.is_system && (
                                        <Lock size={12} className="text-primary" />
                                    )}
                                    <span
                                        className="text-sm px-2.5 py-1 rounded-full"
                                        style={{
                                            backgroundColor: `${tag.color}20`,
                                            color: tag.color,
                                        }}
                                    >
                                        {tag.name}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteTag(tag.id)}
                                    disabled={tag.is_system}
                                    className="h-6 w-6 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
