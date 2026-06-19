import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { useCollection } from '../context/useCollection';

interface AddToCollectionSheetProps {
  open: boolean;
  onClose(): void;
  onConfirm(collectionId: string): void;
}

export function AddToCollectionSheet({ open, onClose, onConfirm }: AddToCollectionSheetProps) {
  const { collections, createCollection } = useCollection();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const activeId = selectedId ?? collections[0]?.id ?? null;

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const entry = await createCollection(name);
    setCreating(false);
    setNewName('');
    setSelectedId(entry.id);
  }

  return (
    <BottomSheet open={open} title="Add to a box" onClose={onClose}>
      <div className="space-y-1.5">
        {collections.map((c) => {
          const selected = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(c.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                selected
                  ? 'border-brand bg-brand-soft text-brand-dark'
                  : 'border-slate-200 text-ink hover:border-slate-300'
              }`}
            >
              {c.name}
              {selected ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New box name"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-ink disabled:opacity-50"
        >
          Create
        </button>
      </div>

      <button
        type="button"
        onClick={() => activeId && onConfirm(activeId)}
        disabled={!activeId}
        className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Add to collection
      </button>
    </BottomSheet>
  );
}
