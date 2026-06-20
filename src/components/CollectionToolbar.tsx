export type SortMode = 'value' | 'recent' | 'series';
export type GroupMode = 'none' | 'series' | 'creator' | 'grade' | 'box';

interface CollectionToolbarProps {
  sort: SortMode;
  onSortChange(sort: SortMode): void;
  group: GroupMode;
  onGroupChange(group: GroupMode): void;
  /** Grouping by box is meaningless while already filtered to a single box. */
  showBoxGroup: boolean;
}

export function CollectionToolbar({ sort, onSortChange, group, onGroupChange, showBoxGroup }: CollectionToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="Sort by">
        <TabButton label="Most valuable" selected={sort === 'value'} onClick={() => onSortChange('value')} />
        <TabButton label="Recently added" selected={sort === 'recent'} onClick={() => onSortChange('recent')} />
        <TabButton label="Series" selected={sort === 'series'} onClick={() => onSortChange('series')} />
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="collection-group">
          Group by
        </label>
        <select
          id="collection-group"
          value={group}
          onChange={(e) => onGroupChange(e.target.value as GroupMode)}
          className="rounded-full border border-slate-200 bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink"
        >
          <option value="none">No grouping</option>
          <option value="series">By series</option>
          <option value="creator">By creator</option>
          <option value="grade">By grade</option>
          {showBoxGroup ? <option value="box">By box</option> : null}
        </select>
      </div>
    </div>
  );
}

function TabButton({ label, selected, onClick }: { label: string; selected: boolean; onClick(): void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        selected ? 'bg-brand text-ink-on-brand' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
