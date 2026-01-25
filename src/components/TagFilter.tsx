import { X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '../lib/utils';

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
                return (
                    <Badge
                        key={tag.id}
                        variant="outline"
                        className={cn(
                            'cursor-pointer transition-all hover:opacity-100',
                            isActive
                                ? 'ring-2 ring-offset-1 ring-offset-background opacity-100'
                                : 'opacity-60'
                        )}
                        style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: `${tag.color}40`,
                            ...(isActive ? { ringColor: tag.color } : {}),
                        }}
                        onClick={() => toggleTag(tag.id)}
                        asChild
                    >
                        <button className="inline-flex items-center gap-1.5">
                            {tag.name}
                            {isActive && <X size={12} />}
                        </button>
                    </Badge>
                );
            })}
        </div>
    );
}
