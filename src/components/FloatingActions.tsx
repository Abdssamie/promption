import { Plus, Copy, Tags, Trash2, Lock, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
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
import { AgentExport } from './AgentExport';

export function FloatingActions() {
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showAgentExport, setShowAgentExport] = useState(false);
    const messageTimeoutRef = useRef<number | null>(null);
    const copiedTimeoutRef = useRef<number | null>(null);

    const viewMode = useAppStore((s) => s.viewMode);
    const selectedItems = useAppStore((s) => s.selectedItems);
    const selectedAgents = useAppStore((s) => s.selectedAgents);
    const getSelectedItemsData = useAppStore((s) => s.getSelectedItemsData);
    const getSelectedAgentsData = useAppStore((s) => s.getSelectedAgentsData);
    const setCreating = useAppStore((s) => s.setCreating);

    // Cleanup timeouts on unmount
    useEffect(() => {
        // Listen for export agents event from keyboard shortcut
        const handleExportAgentsEvent = () => {
            if (selectedAgents.size > 0) {
                setShowAgentExport(true);
            }
        };
        
        window.addEventListener('exportAgents', handleExportAgentsEvent);
        
        return () => {
            if (messageTimeoutRef.current !== null) {
                clearTimeout(messageTimeoutRef.current);
            }
            if (copiedTimeoutRef.current !== null) {
                clearTimeout(copiedTimeoutRef.current);
            }
            window.removeEventListener('exportAgents', handleExportAgentsEvent);
        };
    }, [selectedAgents]);

    const handleCopyCommand = async () => {
        if (viewMode === 'agents') {
            // Show export dialog for agents
            const agentsToExport = getSelectedAgentsData();
            if (agentsToExport.length === 0) {
                setMessage({ type: 'error', text: 'Select agents first' });
                if (messageTimeoutRef.current !== null) {
                    clearTimeout(messageTimeoutRef.current);
                }
                messageTimeoutRef.current = window.setTimeout(() => {
                    setMessage(null);
                    messageTimeoutRef.current = null;
                }, 3000);
                return;
            }
            setShowAgentExport(true);
        } else {
            // Original items export logic
            const itemsToExport = getSelectedItemsData();
            if (itemsToExport.length === 0) {
                setMessage({ type: 'error', text: 'Select prompts first' });
                if (messageTimeoutRef.current !== null) {
                    clearTimeout(messageTimeoutRef.current);
                }
                messageTimeoutRef.current = window.setTimeout(() => {
                    setMessage(null);
                    messageTimeoutRef.current = null;
                }, 3000);
                return;
            }

            const ids = itemsToExport.map((item) => item.id).join(',');
            const command = `promption sync --ids=${ids}`;
            
            try {
                await navigator.clipboard.writeText(command);
                setCopied(true);
                setMessage({ type: 'success', text: 'Command copied! Run in your project directory' });
                
                if (copiedTimeoutRef.current !== null) {
                    clearTimeout(copiedTimeoutRef.current);
                }
                copiedTimeoutRef.current = window.setTimeout(() => {
                    setCopied(false);
                    copiedTimeoutRef.current = null;
                }, 2000);
            } catch {
                setMessage({ type: 'error', text: 'Failed to copy command' });
            }
            
            if (messageTimeoutRef.current !== null) {
                clearTimeout(messageTimeoutRef.current);
            }
            messageTimeoutRef.current = window.setTimeout(() => {
                setMessage(null);
                messageTimeoutRef.current = null;
            }, 4000);
        }
    };

    const handleCreateNew = (type: ItemType) => {
        setCreating(true, type);
    };

    const hasSelection = viewMode === 'agents' ? selectedAgents.size > 0 : selectedItems.size > 0;
    const isItemsView = viewMode === 'items';

    return (
        <>
            {/* Agent Export Dialog */}
            {showAgentExport && (
                <AgentExport
                    agents={getSelectedAgentsData()}
                    onClose={() => setShowAgentExport(false)}
                />
            )}
            {/* Message toast */}
            {message && (
                <div className="fixed bottom-24 right-6 z-50 animate-fadeIn">
                    <div
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm shadow-lg',
                            message.type === 'success'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                : 'bg-destructive/20 text-destructive border border-destructive/30'
                        )}
                    >
                        {message.text}
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

                    {/* Export/Copy Command */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCommand}
                        disabled={!hasSelection}
                        className="gap-2"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {viewMode === 'agents' ? 'Export' : (copied ? 'Copied!' : 'Copy Cmd')}
                    </Button>

                    {/* Divider - only show for items view */}
                    {isItemsView && <div className="h-6 w-px bg-border" />}

                    {/* Create buttons - only show for items view */}
                    {isItemsView && (
                        <>
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
                        </>
                    )}
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
