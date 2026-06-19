export type ViewMode = 'list' | 'card';
export type SortMode = 'recent' | 'title' | 'value';
export type GroupMode = 'none' | 'series' | 'creator' | 'grade' | 'box';

interface CollectionToolbarProps {
  view: ViewMode;
  onViewChange(view: ViewMode): void;
  sort: SortMode;
  onSortChange(sort: SortMode): void;
  group: GroupMode;
  onGroupChange(group: GroupMode): void;
  /** Grouping by box is meaningless while already filtered to a single box. */
  showBoxGroup: boolean;
}

export function CollectionToolbar({
  view,
  onViewChange,
  sort,
  onSortChange,
  group,
  onGroupChange,
  showBoxGroup,
}: CollectionToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="View">
        <ViewButton label="List" selected={view === 'list'} onClick={() => onViewChange('list')} />
        <ViewButton label="Cards" selected={view === 'card'} onClick={() => onViewChange('card')} />
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="collection-sort">
          Sort by
        </label>
        <select
          id="collection-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          className="rounded-full border border-slate-200 bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink"
        >
          <option value="recent">Recently added</option>
          <option value="title">Title</option>
          <option value="value">Value</option>
        </select>

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

function ViewButton({ label, selected, onClick }: { label: string; selected: boolean; onClick(): void }) {
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
