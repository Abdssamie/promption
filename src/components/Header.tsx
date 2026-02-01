import { CheckSquare, Square, Keyboard, Package, Bot } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { ZoomControls } from './ZoomControls';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';

export function Header() {
    const selectedItems = useAppStore((s) => s.selectedItems);
    const filteredItems = useAppStore((s) => s.filteredItems);
    const selectAll = useAppStore((s) => s.selectAll);
    const deselectAll = useAppStore((s) => s.deselectAll);
    const viewMode = useAppStore((s) => s.viewMode);
    const setViewMode = useAppStore((s) => s.setViewMode);
    const [showShortcuts, setShowShortcuts] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return;
                }
                e.preventDefault();
                setShowShortcuts(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const hasSelection = selectedItems.size > 0;
    const allSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedItems.has(i.id));

    return (
        <header className="flex items-center justify-between px-4 py-2 border-b bg-secondary/50">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <img 
                        src="/promption.png" 
                        alt="Promption Logo" 
                        className="h-6 w-6 object-contain rounded-full border-2 border-primary/30"
                    />
                    <h1 className="text-lg font-bold">
                        <span className="text-primary">Promp</span>tion
                    </h1>
                </div>

                {/* View Mode Toggle */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'items' | 'agents')}>
                    <TabsList>
                        <TabsTrigger value="items" className="gap-1.5">
                            <Package size={14} />
                            Prompts
                        </TabsTrigger>
                        <TabsTrigger value="agents" className="gap-1.5">
                            <Bot size={14} />
                            Agents
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Selection controls - only show for items view */}
                {viewMode === 'items' && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={allSelected ? deselectAll : selectAll}
                            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                        {hasSelection && (
                            <span className="text-xs text-muted-foreground">
                                {selectedItems.size} selected
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowShortcuts(true)}
                    title="Keyboard Shortcuts"
                >
                    <Keyboard size={18} />
                </Button>
                <KeyboardShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
                <ThemeToggle />
                <ZoomControls />
            </div>
        </header>
    );
}
