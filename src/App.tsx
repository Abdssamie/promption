import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TypeFilter } from './components/TypeFilter';
import { TagFilter } from './components/TagFilter';
import { ItemList } from './components/ItemList';
import { ItemEditor } from './components/ItemEditor';
import { AgentList } from './components/AgentList';
import { AgentEditor } from './components/AgentEditor';
import { FloatingActions } from './components/FloatingActions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function App() {
  const loadData = useAppStore((s) => s.loadData);
  const editingItem = useAppStore((s) => s.editingItem);
  const editingAgent = useAppStore((s) => s.editingAgent);
  const isCreating = useAppStore((s) => s.isCreating);
  const createType = useAppStore((s) => s.createType);
  const viewMode = useAppStore((s) => s.viewMode);
  const setEditing = useAppStore((s) => s.setEditing);
  const setEditingAgent = useAppStore((s) => s.setEditingAgent);
  const setCreating = useAppStore((s) => s.setCreating);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCloseEditor = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleCloseAgentEditor = () => {
    setEditingAgent(null);
  };

  const handleCreateAgent = () => {
    // Use empty id as sentinel for create mode - AgentEditor checks agent?.id
    setEditingAgent({ id: '', name: '', mode: 'subagent', created_at: '', updated_at: '' });
  };

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <Header />

      {/* Filters bar - only show for items view */}
      {viewMode === 'items' && (
        <div className="px-6 py-3 border-b border-border bg-bg-secondary space-y-3">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1">
              <SearchBar />
            </div>
            <TypeFilter />
          </div>
          <TagFilter />
        </div>
      )}

      {/* Agents header - only show for agents view */}
      {viewMode === 'agents' && (
        <div className="px-6 py-3 border-b border-border bg-bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Agent Configurations</h2>
              <p className="text-sm text-muted-foreground">Manage OpenCode agent settings</p>
            </div>
            <Button onClick={handleCreateAgent}>
              <Plus size={16} />
              New Agent
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'items' ? <ItemList /> : <AgentList />}
      </div>

      {/* Editor modal */}
      {(editingItem || isCreating) && (
        <ItemEditor
          item={editingItem ?? undefined}
          createType={isCreating ? createType : undefined}
          onClose={handleCloseEditor}
        />
      )}

      {/* Agent editor modal */}
      {editingAgent && (
        <AgentEditor
          agent={editingAgent.id ? editingAgent : undefined}
          onClose={handleCloseAgentEditor}
        />
      )}

      {/* Floating Actions Widget */}
      <FloatingActions />
    </div>
  );
}

export default App;
