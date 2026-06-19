interface SearchBarProps {
  value: string;
  onChange(value: string): void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, autoFocus }: SearchBarProps) {
  return (
    <div className="relative">
      <label htmlFor="comic-search" className="sr-only">
        Search by title or issue number
      </label>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-soft"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        id="comic-search"
        type="search"
        inputMode="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or issue, e.g. Amazing Spider-Man 300"
        className="w-full rounded-xl border border-slate-200 bg-paper py-3 pl-10 pr-3 text-sm text-ink placeholder:text-ink-soft focus-visible:border-brand"
      />
    </div>
  );
}
