import { Plus, Download, Tags, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { exportItems } from '../services/export';
import { cn, TAG_COLORS } from '../lib/utils';
import type { ItemType } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function Header() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const selectedItems = useAppStore((s) => s.selectedItems);
    const getSelectedItemsData = useAppStore((s) => s.getSelectedItemsData);
    const filteredItems = useAppStore((s) => s.filteredItems);
    const setCreating = useAppStore((s) => s.setCreating);
    const selectAll = useAppStore((s) => s.selectAll);
    const deselectAll = useAppStore((s) => s.deselectAll);

    const hasSelection = selectedItems.size > 0;
    const allSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedItems.has(i.id));

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
        <header className="flex items-center justify-between px-6 py-4 border-b bg-secondary/50">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">
                    <span className="text-primary">Promp</span>tion
                </h1>

                {/* Selection controls */}
                <div className="flex items-center gap-2 ml-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={allSelected ? deselectAll : selectAll}
                        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                    {hasSelection && (
                        <span className="text-xs text-muted-foreground">
                            {selectedItems.size} selected
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Export message */}
                {exportMessage && (
                    <div
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm animate-fadeIn',
                            exportMessage.type === 'success'
                                ? 'bg-green-500/20 text-green-500' // fallback colors as I don't have exact token mapping, using generic or keeping logic
                                : 'bg-destructive/20 text-destructive'
                        )}
                    >
                        {exportMessage.text}
                    </div>
                )}

                {/* Tag Manager */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
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
                    variant={hasSelection ? "secondary" : "ghost"}
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || selectedItems.size === 0}
                    className="gap-2"
                >
                    <Download size={16} />
                    {isExporting ? 'Exporting...' : 'Export'}
                </Button>

                {/* Create buttons */}
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('skill')}
                        className="h-7 px-3 text-xs"
                    >
                        <Plus size={14} className="mr-1.5" />
                        Skill
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('rule')}
                        className="h-7 px-3 text-xs"
                    >
                        <Plus size={14} className="mr-1.5" />
                        Rule
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateNew('workflow')}
                        className="h-7 px-3 text-xs"
                    >
                        <Plus size={14} className="mr-1.5" />
                        Workflow
                    </Button>
                </div>
            </div>
        </header>
    );
}

function TagManagerContent() {
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

    const tags = useAppStore((s) => s.tags);
    const createTag = useAppStore((s) => s.createTag);
    const deleteTag = useAppStore((s) => s.deleteTag);

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
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No tags yet</p>
                ) : (
                    tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                        >
                            <span
                                className="text-sm px-2.5 py-1 rounded-full"
                                style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                }}
                            >
                                {tag.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTag(tag.id)}
                                className="h-6 w-6 hover:text-destructive"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

