import { useState, useRef, useEffect } from 'react';
import { Copy, Check, FileText, Code } from 'lucide-react';
import type { Agent } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { cn } from '../lib/utils';

interface AgentExportProps {
    agents: Agent[];
    onClose: () => void;
}

export function AgentExport({ agents, onClose }: AgentExportProps) {
    const [copiedJson, setCopiedJson] = useState(false);
    const [copiedPrompts, setCopiedPrompts] = useState<Set<string>>(new Set());
    const jsonTimeoutRef = useRef<number | null>(null);
    const promptTimeoutsRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        return () => {
            if (jsonTimeoutRef.current !== null) {
                clearTimeout(jsonTimeoutRef.current);
            }
            promptTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
        };
    }, []);

    // Generate OpenCode JSON config
    const generateJsonConfig = () => {
        const agentConfig: Record<string, unknown> = {};

        agents.forEach((agent) => {
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

            agentConfig[agent.name] = config;
        });

        return JSON.stringify({ agent: agentConfig }, null, 2);
    };

    const handleCopyJson = async () => {
        const jsonConfig = generateJsonConfig();
        await navigator.clipboard.writeText(jsonConfig);
        setCopiedJson(true);
        if (jsonTimeoutRef.current !== null) {
            clearTimeout(jsonTimeoutRef.current);
        }
        jsonTimeoutRef.current = window.setTimeout(() => {
            setCopiedJson(false);
            jsonTimeoutRef.current = null;
        }, 2000);
    };

    const handleCopyPrompt = async (agentName: string, content: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedPrompts((prev) => new Set(prev).add(agentName));

        const existingTimeout = promptTimeoutsRef.current.get(agentName);
        if (existingTimeout !== undefined) {
            clearTimeout(existingTimeout);
        }

        const timeout = window.setTimeout(() => {
            setCopiedPrompts((prev) => {
                const next = new Set(prev);
                next.delete(agentName);
                return next;
            });
            promptTimeoutsRef.current.delete(agentName);
        }, 2000);

        promptTimeoutsRef.current.set(agentName, timeout);
    };

    const agentsWithPrompts = agents.filter((a) => a.prompt_content);

    const getModeColor = (mode: string) => {
        return mode === 'primary' ? '#3b82f6' : '#8b5cf6';
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-lg">
                        Export Agents to OpenCode
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {agents.length} {agents.length === 1 ? 'agent' : 'agents'} selected
                    </p>
                </DialogHeader>

                <Tabs defaultValue="json" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="mx-6 mt-4 w-fit">
                        <TabsTrigger value="json" className="gap-1.5">
                            <Code size={14} />
                            JSON Config
                        </TabsTrigger>
                        <TabsTrigger value="prompts" className="gap-1.5">
                            <FileText size={14} />
                            Prompt Files ({agentsWithPrompts.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* JSON Config Tab */}
                    <TabsContent value="json" className="flex-1 flex flex-col overflow-hidden m-0 p-6 pt-4">
                        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">opencode.json Configuration</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyJson}
                                        className={cn(
                                            "gap-1.5",
                                            copiedJson && "text-green-500 border-green-500"
                                        )}
                                    >
                                        {copiedJson ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedJson ? 'Copied!' : 'Copy JSON'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Add this configuration to your <code className="bg-muted px-1 py-0.5 rounded">opencode.json</code> file
                                </p>
                            </div>

                            <div className="flex-1 overflow-auto border rounded-lg">
                                <SyntaxHighlighter language="json" content={generateJsonConfig()} />
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
                                <p className="font-semibold">Setup Instructions:</p>
                                <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                                    <li>Copy the JSON configuration above</li>
                                    <li>Open your project's <code className="bg-background px-1 py-0.5 rounded">opencode.json</code> file</li>
                                    <li>Merge the configuration into your existing file</li>
                                    <li>Create prompt files (see Prompt Files tab)</li>
                                </ol>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Prompt Files Tab */}
                    <TabsContent value="prompts" className="flex-1 flex flex-col overflow-hidden m-0 p-6 pt-4">
                        {agentsWithPrompts.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No agents with prompt content selected</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 overflow-auto">
                                <div className="bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2 shrink-0">
                                    <p className="font-semibold">Prompt File Setup:</p>
                                    <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                                        <li>Create a <code className="bg-background px-1 py-0.5 rounded">.opencode/prompts/</code> directory in your project</li>
                                        <li>Create each prompt file listed below</li>
                                        <li>Copy the content using the copy button for each agent</li>
                                    </ol>
                                </div>

                                {agentsWithPrompts.map((agent) => (
                                    <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1 flex-1 min-w-0">
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
                                                    <span className="font-mono text-sm font-semibold">{agent.name}</span>
                                                </div>
                                                <code className="text-xs text-muted-foreground block">
                                                    .opencode/prompts/{agent.name}.txt
                                                </code>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyPrompt(agent.name, agent.prompt_content!)}
                                                className={cn(
                                                    "gap-1.5 shrink-0",
                                                    copiedPrompts.has(agent.name) && "text-green-500 border-green-500"
                                                )}
                                            >
                                                {copiedPrompts.has(agent.name) ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedPrompts.has(agent.name) ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>

                                        <div className="border rounded-lg overflow-hidden max-h-[200px]">
                                            <SyntaxHighlighter language="text" content={agent.prompt_content!} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
