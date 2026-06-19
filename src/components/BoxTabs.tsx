import type { Collection } from '../types/comic';

interface BoxTabsProps {
  collections: Collection[];
  activeId: string | 'all';
  onSelect(id: string | 'all'): void;
  onCreateNew(): void;
}

export function BoxTabs({ collections, activeId, onSelect, onCreateNew }: BoxTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Boxes">
      <Tab label="All" selected={activeId === 'all'} onClick={() => onSelect('all')} />
      {collections.map((c) => (
        <Tab key={c.id} label={c.name} selected={activeId === c.id} onClick={() => onSelect(c.id)} />
      ))}
      <button
        type="button"
        onClick={onCreateNew}
        className="flex-none rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-slate-400 hover:text-ink"
      >
        + New box
      </button>
    </div>
  );
}

function Tab({ label, selected, onClick }: { label: string; selected: boolean; onClick(): void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`flex-none rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        selected ? 'bg-brand text-white' : 'border border-slate-200 text-ink-soft hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
