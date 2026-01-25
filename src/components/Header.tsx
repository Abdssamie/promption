import { CheckSquare, Square } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { ZoomControls } from './ZoomControls';

export function Header() {
    const selectedItems = useAppStore((s) => s.selectedItems);
    const filteredItems = useAppStore((s) => s.filteredItems);
    const selectAll = useAppStore((s) => s.selectAll);
    const deselectAll = useAppStore((s) => s.deselectAll);

    const hasSelection = selectedItems.size > 0;
    const allSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedItems.has(i.id));

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-secondary/50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <img 
                        src="/promption.png" 
                        alt="Promption Logo" 
                        className="h-8 w-8 object-contain"
                    />
                    <h1 className="text-xl font-bold">
                        <span className="text-primary">Promp</span>tion
                    </h1>
                </div>

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
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Zoom Controls */}
                <ZoomControls />
            </div>
        </header>
    );
}
