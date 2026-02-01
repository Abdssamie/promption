import { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import type { Agent } from '../types';
import { useAppStore } from '../store/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '../lib/utils';

interface AgentCardProps {
    agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
    const [copied, setCopied] = useState(false);
    const selectedAgents = useAppStore((s) => s.selectedAgents);
    const toggleSelectAgent = useAppStore((s) => s.toggleSelectAgent);
    const setEditingAgent = useAppStore((s) => s.setEditingAgent);
    const deleteAgent = useAppStore((s) => s.deleteAgent);

    const isSelected = selectedAgents.has(agent.id);
    const toolsCount = agent.tools_config ? Object.keys(agent.tools_config).length : 0;
    const permissionsCount = agent.permissions_config ? Object.keys(agent.permissions_config).length : 0;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Build the OpenCode JSON config for this agent with "agent" wrapper
        const config: Record<string, unknown> = {
            mode: agent.mode,
        };
        
        if (agent.model) {
            config.model = agent.model;
        }
        if (agent.prompt_content) {
            config.prompt = `{file:.opencode/prompts/${agent.name}.txt}`;
        }
        if (agent.tools_config && Object.keys(agent.tools_config).length > 0) {
            config.tools = agent.tools_config;
        }
        if (agent.permissions_config && Object.keys(agent.permissions_config).length > 0) {
            config.permissions = agent.permissions_config;
        }

        const jsonStr = JSON.stringify({ agent: { [agent.name]: config } }, null, 2);
        await navigator.clipboard.writeText(jsonStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteAgent(agent.id);
    };

    const getModeColor = (mode: string) => {
        return mode === 'primary' ? '#3b82f6' : '#8b5cf6';
    };

    return (
        <Card
            className={cn(
                'group relative transition-all duration-150 cursor-pointer overflow-hidden p-0 gap-0 hover:border-primary/50',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary'
            )}
            onClick={() => setEditingAgent(agent)}
        >
            {/* Selection checkbox - bottom right */}
            <div
                className="absolute bottom-4 right-4 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectAgent(agent.id)}
                    className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground w-5 h-5",
                        "transition-all duration-200",
                        !isSelected && "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                    )}
                />
            </div>

            {/* Header */}
            <CardHeader className="p-4 pb-2 space-y-1 relative z-0">
                <div className="flex items-start justify-between min-w-0">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge
                                style={{
                                    backgroundColor: `${getModeColor(agent.mode)}20`,
                                    color: getModeColor(agent.mode),
                                }}
                                className="text-xs font-semibold"
                            >
                                {agent.mode}
                            </Badge>
                        </div>
                        <CardTitle className="truncate text-base font-mono">{agent.name}</CardTitle>
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
                            title="Copy JSON config"
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

            <CardContent className="p-4 pt-0 space-y-3">
                {/* Model */}
                {agent.model && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Model:</span>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{agent.model}</code>
                    </div>
                )}

                {/* Prompt Preview */}
                {agent.prompt_content && (
                    <div className="text-xs text-muted-foreground">
                        <div className="bg-muted/50 p-2 rounded border border-border/50 overflow-hidden">
                            <div className="line-clamp-2 font-mono">
                                {agent.prompt_content}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats badges */}
                <div className="flex flex-wrap gap-1.5">
                    {toolsCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {toolsCount} {toolsCount === 1 ? 'tool' : 'tools'}
                        </Badge>
                    )}
                    {permissionsCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {permissionsCount} {permissionsCount === 1 ? 'permission' : 'permissions'}
                        </Badge>
                    )}
                    {!toolsCount && !permissionsCount && !agent.model && !agent.prompt_content && (
                        <span className="text-xs text-muted-foreground italic">No configuration</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
