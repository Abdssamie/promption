import { Loader2, Bot } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { AgentCard } from './AgentCard';

export function AgentList() {
    const isLoading = useAppStore((s) => s.isLoading);
    const agents = useAppStore((s) => s.agents);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (agents.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full w-full">
                <Bot className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No agents found</p>
                <p className="text-sm">Create a new agent configuration to get started</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 h-full">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
        </div>
    );
}
