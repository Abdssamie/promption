import { X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '../lib/utils';
import { TechIcon } from './TechIcon';
import { POPULAR_TECHNOLOGIES } from '../constants/technologies';

export function TagFilter() {
    const tags = useAppStore((s) => s.tags);
    const tagFilter = useAppStore((s) => s.tagFilter);
    const setTagFilter = useAppStore((s) => s.setTagFilter);

    const toggleTag = (tagId: string) => {
        if (tagFilter.includes(tagId)) {
            setTagFilter(tagFilter.filter((id) => id !== tagId));
        } else {
            setTagFilter([...tagFilter, tagId]);
        }
    };

    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                const isActive = tagFilter.includes(tag.id);
                // Check if this tag matches a technology
                const tech = POPULAR_TECHNOLOGIES.find(
                    t => t.name.toLowerCase() === tag.name.toLowerCase()
                );
                
                return (
                    <Badge
                        key={tag.id}
                        variant="outline"
                        className={cn(
                            'cursor-pointer transition-all hover:opacity-100 bg-secondary/50',
                            isActive
                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background opacity-100'
                                : 'opacity-60'
                        )}
                        onClick={() => toggleTag(tag.id)}
                        asChild
                    >
                        <button className="inline-flex items-center gap-1.5">
                            {tech ? (
                                <TechIcon slug={tech.iconSlug} size={14} color={tech.color} />
                            ) : (
                                <span className="text-muted-foreground">#</span>
                            )}
                            {tag.name}
                            {isActive && <X size={12} />}
                        </button>
                    </Badge>
                );
            })}
        </div>
    );
}
