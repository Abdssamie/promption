import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TypeFilter } from './components/TypeFilter';
import { TagFilter } from './components/TagFilter';
import { ItemList } from './components/ItemList';
import { ItemEditor } from './components/ItemEditor';
import { FloatingActions } from './components/FloatingActions';

function App() {
  const loadData = useAppStore((s) => s.loadData);
  const editingItem = useAppStore((s) => s.editingItem);
  const isCreating = useAppStore((s) => s.isCreating);
  const createType = useAppStore((s) => s.createType);
  const setEditing = useAppStore((s) => s.setEditing);
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

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <Header />

      {/* Filters bar */}
      <div className="px-6 py-3 border-b border-border bg-bg-secondary space-y-3">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1">
            <SearchBar />
          </div>
          <TypeFilter />
        </div>
        <TagFilter />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ItemList />
      </div>

      {/* Editor modal */}
      {(editingItem || isCreating) && (
        <ItemEditor
          item={editingItem ?? undefined}
          createType={isCreating ? createType : undefined}
          onClose={handleCloseEditor}
        />
      )}

      {/* Floating Actions Widget */}
      <FloatingActions />
    </div>
  );
}

export default App;
