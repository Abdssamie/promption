import { Copy, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { cn, formatDate, getItemTypeColor, getItemTypeLabel, truncateText } from '../lib/utils';
import type { Item } from '../types';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { TechIcon } from './TechIcon';
import { POPULAR_TECHNOLOGIES } from '../constants/technologies';

interface ItemCardProps {
    item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
    const [copied, setCopied] = useState(false);
    const selectedItems = useAppStore((s) => s.selectedItems);
    const toggleSelect = useAppStore((s) => s.toggleSelect);
    const setEditing = useAppStore((s) => s.setEditing);
    const deleteItem = useAppStore((s) => s.deleteItem);

    const isSelected = selectedItems.has(item.id);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete "${item.name}"?`)) {
            await deleteItem(item.id);
        }
    };

    return (
        <Card
            className={cn(
                'group relative transition-all duration-150 cursor-pointer overflow-hidden p-0 gap-0 hover:border-primary/50',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary'
            )}
            onClick={() => setEditing(item)}
        >
            {/* Selection checkbox */}
            <div
                className="absolute top-4 left-4 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(item.id)}
                    className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                        !isSelected && "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                />
            </div>

            {/* Header */}
            <CardHeader className="pl-12 p-4 pb-2 space-y-1 relative z-0">
                <div className="flex items-start justify-between min-w-0">
                    <div className="flex-1 min-w-0 space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${getItemTypeColor(item.item_type)}20`,
                                    color: getItemTypeColor(item.item_type),
                                }}
                            >
                                {getItemTypeLabel(item.item_type)}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(item.updated_at)}</span>
                        </div>
                        <CardTitle className="truncate text-base">{item.name}</CardTitle>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className={cn(
                                "h-8 w-8",
                                copied && "text-green-500 hover:text-green-600"
                            )}
                            title="Copy content"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-8 w-8 hover:text-destructive"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pl-12 p-4 pt-0">
                {/* Tags */}
                {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.map((tag) => {
                            // Check if this tag matches a technology
                            const tech = POPULAR_TECHNOLOGIES.find(
                                t => t.name.toLowerCase() === tag.name.toLowerCase()
                            );
                            
                            return (
                                <span
                                    key={tag.id}
                                    className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground flex items-center gap-1.5"
                                    style={{
                                        backgroundColor: `${tag.color}15`,
                                        color: tag.color,
                                        border: `1px solid ${tag.color}30`
                                    }}
                                >
                                    {tech && <TechIcon slug={tech.iconSlug} size={16} color={tech.color} />}
                                    #{tag.name}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Content preview */}
                <div className="relative">
                    <div className="text-xs rounded-md bg-muted/80 p-3 overflow-hidden max-h-32 border border-border/50">
                        <SyntaxHighlighter
                            content={truncateText(item.content, 300)}
                            language="markdown"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

