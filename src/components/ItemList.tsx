import { useAppStore } from '../store/appStore';
import { ItemCard } from './ItemCard';
import { Loader2, FileText } from 'lucide-react';

export function ItemList() {
    const isLoading = useAppStore((s) => s.isLoading);
    const items = useAppStore((s) => s.filteredItems);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm">Create a new skill, rule, or workflow to get started</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 h-full">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
