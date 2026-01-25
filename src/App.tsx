import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TypeFilter } from './components/TypeFilter';
import { TagFilter } from './components/TagFilter';
import { ItemList } from './components/ItemList';
import { ItemEditor } from './components/ItemEditor';

function App() {
  const loadData = useAppStore((s) => s.loadData);
  const editingItem = useAppStore((s) => s.editingItem);
  const isCreating = useAppStore((s) => s.isCreating);
  const createType = useAppStore((s) => s.createType);
  const setEditing = useAppStore((s) => s.setEditing);
  const setCreating = useAppStore((s) => s.setCreating);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCloseEditor = () => {
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary">
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
      <ItemList />

      {/* Editor modal */}
      {(editingItem || isCreating) && (
        <ItemEditor
          item={editingItem ?? undefined}
          createType={isCreating ? createType : undefined}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}

export default App;
