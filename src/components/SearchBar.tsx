import { Search, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar() {
    const searchQuery = useAppStore((s) => s.searchQuery);
    const setSearch = useAppStore((s) => s.setSearch);

    return (
        <div className="relative">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={18}
            />
            <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, skills, rules..."
                className="pl-10 pr-10"
                data-search-input
            />
            {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSearch('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                    <X size={16} />
                </Button>
            )}
        </div>
    );
}
