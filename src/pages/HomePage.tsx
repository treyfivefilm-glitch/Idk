import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ComicListItem } from '../components/ComicListItem';
import { EmptyState } from '../components/EmptyState';
import { searchCatalog } from '../data/catalog';

export function HomePage() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCatalog(query), [query]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M5 4h11l3 3v13H5V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-lg font-bold text-ink">PanelWorth</span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">Find out what your comics are actually worth — honestly.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          to="/scan/cover"
          className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-4 text-center hover:border-brand"
        >
          <CameraIcon />
          <span className="text-sm font-semibold text-ink">Scan cover</span>
        </Link>
        <Link
          to="/scan/barcode"
          className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-4 text-center hover:border-brand"
        >
          <BarcodeIcon />
          <span className="text-sm font-semibold text-ink">Scan barcode</span>
        </Link>
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Search is the most reliable way to find a comic today. Cover and barcode scanning work against our demo
        catalog — full accuracy in production depends on live pricing data and a trained recognition model.
      </p>

      <div className="mt-5">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-3">
        {query.trim() === '' ? (
          <EmptyState
            title="Search our demo catalog"
            message='Try "Spider-Man 300", "Hulk 181", or "Saga".'
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No match"
            message="We couldn't find that in our demo catalog. Try a different title, issue number, or scan the cover/barcode instead."
          />
        ) : (
          <ul className="space-y-2">
            {results.map((issue) => (
              <li key={issue.id}>
                <ComicListItem issue={issue} to={`/results/${issue.id}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-brand" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 015.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0120 8.5v9A1.5 1.5 0 0118.5 19h-13A1.5 1.5 0 014 17.5v-9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BarcodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-brand" aria-hidden="true">
      <path
        d="M4 5v14M8 5v14M11 5v14M14 5v14M16.5 5v14M20 5v14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
