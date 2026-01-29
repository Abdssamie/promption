import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Agent, AgentFormData, AgentMode } from '../types';
import { useAppStore } from '../store/appStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface AgentEditorProps {
    agent?: Agent;
    onClose: () => void;
}

const COMMON_TOOLS = ['write', 'edit', 'bash', 'read', 'search', 'grep'];
const COMMON_PERMISSIONS = ['edit', 'bash', 'webfetch'];
const PERMISSION_OPTIONS: Array<'ask' | 'allow' | 'deny'> = ['ask', 'allow', 'deny'];

export function AgentEditor({ agent, onClose }: AgentEditorProps) {
    const isCreating = !agent;
    
    const [name, setName] = useState(agent?.name ?? '');
    const [mode, setMode] = useState<AgentMode>(agent?.mode ?? 'subagent');
    const [model, setModel] = useState(agent?.model ?? '');
    const [promptContent, setPromptContent] = useState(agent?.prompt_content ?? '');
    const [toolsConfig, setToolsConfig] = useState<Record<string, boolean | string>>(
        agent?.tools_config ?? {}
    );
    const [permissionsConfig, setPermissionsConfig] = useState<Record<string, 'ask' | 'allow' | 'deny'>>(
        agent?.permissions_config ?? {}
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const createAgent = useAppStore((s) => s.createAgent);
    const updateAgent = useAppStore((s) => s.updateAgent);

    // Validate name on change
    const validateName = (value: string) => {
        if (!value.trim()) {
            setNameError('Agent name is required');
            return false;
        }
        const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        if (!kebabCaseRegex.test(value)) {
            setNameError('Must be kebab-case (lowercase, numbers, hyphens only)');
            return false;
        }
        setNameError(null);
        return true;
    };

    const handleNameChange = (value: string) => {
        setName(value);
        validateName(value);
    };

    const handleToolToggle = (tool: string) => {
        setToolsConfig(prev => {
            const newConfig = { ...prev };
            if (newConfig[tool]) {
                delete newConfig[tool];
            } else {
                newConfig[tool] = true;
            }
            return newConfig;
        });
    };

    const handlePermissionChange = (permission: string, value: 'ask' | 'allow' | 'deny') => {
        setPermissionsConfig(prev => ({
            ...prev,
            [permission]: value
        }));
    };

    const handleSave = async () => {
        if (!validateName(name)) return;

        setIsSaving(true);
        setError(null);
        try {
            const data: AgentFormData = {
                name: name.trim(),
                mode,
                model: model.trim() || undefined,
                prompt_content: promptContent.trim() || undefined,
                tools_config: Object.keys(toolsConfig).length > 0 ? toolsConfig : undefined,
                permissions_config: Object.keys(permissionsConfig).length > 0 ? permissionsConfig : undefined,
            };

            if (isCreating) {
                await createAgent(data);
            } else {
                await updateAgent(agent.id, data);
            }
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save agent';
            setError(message);
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 pb-3 border-b shrink-0">
                    <DialogTitle className="text-base">
                        {isCreating ? 'Create New Agent' : `Edit Agent: ${agent.name}`}
                    </DialogTitle>
                </DialogHeader>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {/* Error message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="agent-name">Agent Name *</Label>
                        <Input
                            id="agent-name"
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="my-custom-agent"
                            className={nameError ? 'border-destructive' : ''}
                        />
                        {nameError && (
                            <p className="text-xs text-destructive">{nameError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                    </div>

                    {/* Mode */}
                    <div className="space-y-2">
                        <Label>Mode *</Label>
                        <Tabs value={mode} onValueChange={(value) => setMode(value as AgentMode)}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="subagent">Subagent</TabsTrigger>
                                <TabsTrigger value="primary">Primary</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-xs text-muted-foreground">
                            Primary agents are main assistants, subagents are specialized helpers
                        </p>
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                            id="model"
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="anthropic/claude-sonnet-4-20250514"
                        />
                        <p className="text-xs text-muted-foreground">Format: provider/model-id (optional)</p>
                    </div>

                    {/* Prompt Content */}
                    <div className="space-y-2">
                        <Label htmlFor="prompt">System Prompt</Label>
                        <Textarea
                            id="prompt"
                            value={promptContent}
                            onChange={(e) => setPromptContent(e.target.value)}
                            placeholder="You are a specialized agent that..."
                            className="min-h-[120px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Custom instructions for this agent (optional)</p>
                    </div>

                    {/* Tools Configuration */}
                    <div className="space-y-2">
                        <Label>Tools</Label>
                        <div className="border rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2">
                                {COMMON_TOOLS.map(tool => (
                                    <div key={tool} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tool-${tool}`}
                                            checked={!!toolsConfig[tool]}
                                            onCheckedChange={() => handleToolToggle(tool)}
                                        />
                                        <label
                                            htmlFor={`tool-${tool}`}
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {tool}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Select which tools this agent can use</p>
                    </div>

                    {/* Permissions Configuration */}
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="border rounded-lg p-3 space-y-3">
                            {COMMON_PERMISSIONS.map(permission => (
                                <div key={permission} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{permission}</span>
                                    <div className="flex gap-1">
                                        {PERMISSION_OPTIONS.map(option => (
                                            <Button
                                                key={option}
                                                variant={permissionsConfig[permission] === option ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePermissionChange(permission, option)}
                                                className="h-7 text-xs px-2"
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                        {permissionsConfig[permission] && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newConfig = { ...permissionsConfig };
                                                    delete newConfig[permission];
                                                    setPermissionsConfig(newConfig);
                                                }}
                                                className="h-7 text-xs px-2"
                                            >
                                                <X size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Configure permission levels: ask for approval, allow automatically, or deny</p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 pt-3 border-t shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !!nameError || isSaving}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : isCreating ? 'Create Agent' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
