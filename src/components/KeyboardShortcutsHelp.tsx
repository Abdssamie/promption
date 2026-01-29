import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Command } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Shortcut {
    keys: string[];
    description: string;
}

const SHORTCUTS: Shortcut[] = [
    { keys: ['Cmd', 'N'], description: 'New Item (Default)' },
    { keys: ['Cmd', 'Shift', 'S'], description: 'New Skill' },
    { keys: ['Cmd', 'Shift', 'R'], description: 'New Rule' },
    { keys: ['Cmd', 'Shift', 'W'], description: 'New Workflow' },
    { keys: ['Cmd', 'F'], description: 'Focus Search' },
    { keys: ['Cmd', 'A'], description: 'Select All' },
    { keys: ['Cmd', 'D'], description: 'Deselect All' },
    { keys: ['Cmd', 'C'], description: 'Copy Command (Selected)' },
    { keys: ['Esc'], description: 'Close / Deselect' },
];

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Command className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Boost your productivity with these keyboard shortcuts.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-3">
                        {SHORTCUTS.map((shortcut, i) => (
                            <div key={i} className="contents text-sm">
                                <span className="text-muted-foreground self-center">
                                    {shortcut.description}
                                </span>
                                <div className="flex items-center gap-1 justify-end">
                                    {shortcut.keys.map((key, k) => (
                                        <span 
                                            key={k}
                                            className="inline-flex items-center justify-center min-w-[24px] px-1.5 h-6 rounded border bg-muted text-[11px] font-medium font-mono text-muted-foreground shadow-sm select-none"
                                        >
                                            {key}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
