import { useState } from 'react';
import { Save, Eye, Edit3, Copy, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn, getItemTypeColor, getItemTypeLabel } from '../lib/utils';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import type { Item, ItemType } from '../types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const PLACEHOLDERS: Record<ItemType, string> = {
    skill: `---
name: your-skill-name
description: A brief description of what this skill does
license: MIT
compatibility: opencode
metadata:
  language: typescript
  framework: react
---

## What I do

- Describe the main behaviors this skill provides
- List specific actions or checks it performs

## When to use me

- Describe scenarios when this skill should be activated
- List relevant use cases

## Examples

### Bad Practice
\`\`\`typescript
// Example of what NOT to do
\`\`\`

### Good Practice
\`\`\`typescript
// Example of the correct approach
\`\`\``,

    rule: `# Rule Name

Describe what this rule enforces or guides.

## Guidelines

- First guideline
- Second guideline
- Third guideline

## Examples

Good:
\`\`\`
Example of correct usage
\`\`\`

Bad:
\`\`\`
Example of incorrect usage
\`\`\``,

    workflow: `---
priority: 1
command_name: your-workflow-name
description: A brief description of what this workflow does
---

## Prerequisites

- List any prerequisites here

## Steps

1. First step description
2. Second step description
3. Third step description

## Notes

Any additional notes or considerations.`,
};

interface ItemEditorProps {
    item?: Item;
    createType?: ItemType;
    onClose: () => void;
}

export function ItemEditor({ item, createType, onClose }: ItemEditorProps) {
    const isCreating = !item;
    const initialType = item?.item_type ?? createType ?? 'skill';

    const [name, setName] = useState(item?.name ?? '');
    const [content, setContent] = useState(item?.content ?? '');
    const [itemType, setItemType] = useState<ItemType>(initialType);
    const [selectedTags, setSelectedTags] = useState<string[]>(item?.tags.map((t) => t.id) ?? []);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const tags = useAppStore((s) => s.tags);
    const createItem = useAppStore((s) => s.createItem);
    const updateItem = useAppStore((s) => s.updateItem);

    const handleSave = async () => {
        if (!name.trim() || !content.trim()) return;

        setIsSaving(true);
        try {
            if (isCreating) {
                await createItem({
                    name: name.trim(),
                    content: content.trim(),
                    item_type: itemType,
                    tag_ids: selectedTags,
                });
            } else {
                await updateItem(item.id, {
                    name: name.trim(),
                    content: content.trim(),
                    item_type: itemType,
                    tag_ids: selectedTags,
                });
            }
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-lg">
                            {isCreating ? 'Create New' : 'Edit'} Item
                        </DialogTitle>
                        {!isCreating && (
                            <Badge
                                variant="secondary"
                                style={{
                                    backgroundColor: `${getItemTypeColor(item.item_type)}20`,
                                    color: getItemTypeColor(item.item_type),
                                }}
                            >
                                {getItemTypeLabel(item.item_type)}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Name and Type */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter a name..."
                            />
                        </div>
                        {isCreating && (
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Tabs value={itemType} onValueChange={(value) => setItemType(value as ItemType)}>
                                    <TabsList>
                                        {(['skill', 'rule', 'workflow'] as ItemType[]).map((type) => (
                                            <TabsTrigger
                                                key={type}
                                                value={type}
                                                style={
                                                    itemType === type
                                                        ? { borderBottom: `2px solid ${getItemTypeColor(type)}` }
                                                        : undefined
                                                }
                                            >
                                                {getItemTypeLabel(type)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    return (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className={cn(
                                                'cursor-pointer transition-all',
                                                isSelected ? 'ring-2 ring-offset-1 ring-offset-background' : 'opacity-60 hover:opacity-100'
                                            )}
                                            style={{
                                                backgroundColor: `${tag.color}20`,
                                                color: tag.color,
                                                borderColor: `${tag.color}`,
                                                ...(isSelected ? { ringColor: tag.color } : {}),
                                            }}
                                            onClick={() => toggleTag(tag.id)}
                                            asChild
                                        >
                                            <button>
                                                {tag.name}
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Content</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className={cn(
                                        copied && 'text-green-500 hover:text-green-600'
                                    )}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                                <Tabs value={mode} onValueChange={(value) => setMode(value as 'edit' | 'preview')}>
                                    <TabsList>
                                        <TabsTrigger value="edit">
                                            <Edit3 size={14} />
                                            Edit
                                        </TabsTrigger>
                                        <TabsTrigger value="preview">
                                            <Eye size={14} />
                                            Preview
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        <div className="relative min-h-[300px] rounded-lg border overflow-hidden">
                            {mode === 'edit' ? (
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={PLACEHOLDERS[itemType]}
                                    className="min-h-[300px] resize-none font-mono text-sm leading-relaxed border-0 focus-visible:ring-0"
                                />
                            ) : (
                                <div className="p-4 overflow-auto max-h-[400px]">
                                    {content ? (
                                        <SyntaxHighlighter content={content} language="markdown" />
                                    ) : (
                                        <p className="text-muted-foreground italic">No content to preview</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-6 pt-4 border-t">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !content.trim() || isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : isCreating ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
