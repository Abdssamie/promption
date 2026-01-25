import { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import type { Tag } from '../types';
import { cn } from '../lib/utils';
import { TechIcon } from './TechIcon';
import { POPULAR_TECHNOLOGIES } from '../constants/technologies';

interface TagComboboxProps {
    tags: Tag[];
    selectedTagIds: string[];
    onTagsChange: (tagIds: string[]) => void;
}

export function TagCombobox({ tags, selectedTagIds, onTagsChange }: TagComboboxProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTags = useMemo(() => {
        if (!searchQuery) return tags;
        const query = searchQuery.toLowerCase();
        return tags.filter(tag => tag.name.toLowerCase().includes(query));
    }, [tags, searchQuery]);

    const systemTags = useMemo(() => 
        filteredTags.filter(tag => tag.is_system),
        [filteredTags]
    );
    
    const customTags = useMemo(() => 
        filteredTags.filter(tag => !tag.is_system),
        [filteredTags]
    );

    const selectedTags = useMemo(() => 
        tags.filter(tag => selectedTagIds.includes(tag.id)),
        [tags, selectedTagIds]
    );

    const handleToggleTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onTagsChange([...selectedTagIds, tagId]);
        }
    };

    const handleRemoveTag = (tagId: string) => {
        onTagsChange(selectedTagIds.filter(id => id !== tagId));
    };

    const getTechIcon = (tagName: string) => {
        return POPULAR_TECHNOLOGIES.find(
            t => t.name.toLowerCase() === tagName.toLowerCase()
        );
    };

    return (
        <div className="space-y-2">
            <Combobox>
                <ComboboxInput
                    placeholder={selectedTags.length > 0 
                        ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                        : 'Search tags...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    showTrigger
                />
                <ComboboxContent>
                    <ComboboxList>
                        <ComboboxEmpty>No tags found.</ComboboxEmpty>
                        
                        {systemTags.length > 0 && (
                            <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    Technologies
                                </div>
                                {systemTags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    const tech = getTechIcon(tag.name);
                                    
                                    return (
                                        <ComboboxItem
                                            key={tag.id}
                                            value={tag.name}
                                            onSelect={() => handleToggleTag(tag.id)}
                                            className="cursor-pointer justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                {tech && (
                                                    <TechIcon 
                                                        slug={tech.iconSlug} 
                                                        size={16} 
                                                        color={tech.color} 
                                                    />
                                                )}
                                                <span>{tag.name}</span>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </ComboboxItem>
                                    );
                                })}
                            </>
                        )}

                        {customTags.length > 0 && (
                            <>
                                {systemTags.length > 0 && (
                                    <div className="h-px bg-border my-1" />
                                )}
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    Custom Tags
                                </div>
                                {customTags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    
                                    return (
                                        <ComboboxItem
                                            key={tag.id}
                                            value={tag.name}
                                            onSelect={() => handleToggleTag(tag.id)}
                                            className="cursor-pointer justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                             <span 
                                                    className="w-3 h-3 rounded-full shrink-0" 
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span>{tag.name}</span>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </ComboboxItem>
                          );
                                })}
                            </>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>

            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-secondary/20 max-h-32 overflow-y-auto">
                    {selectedTags.map((tag) => {
                        const tech = getTechIcon(tag.name);
                        
                        return (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className={cn(
                                    'gap-1 pr-1',
                                    tag.is_system && 'border-primary/30'
                                )}
                                style={{
                                    backgroundColor: `${tag.color}15`,
                                    color: tag.color,
                                    borderColor: tag.color,
                                }}
                            >
                                {tech && (
                                    <TechIcon 
                                        slug={tech.iconSlug} 
                                        size={14} 
                                        color={tech.color} 
                                    />
                                )}
                                <span className="text-xs">{tag.name}</span>
                                <button
                                    onClick={() => handleRemoveTag(tag.id)}
                                    className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                                >
                           <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
