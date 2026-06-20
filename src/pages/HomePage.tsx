import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ComicListItem } from '../components/ComicListItem';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { GainLossPill } from '../components/GainLossPill';
import { getIssueById, registerDiscoveredIssue } from '../data/catalog';
import { useCollection } from '../context/useCollection';
import { fetchValue } from '../services/value';
import { calculateBand, adjustBandForCondition, formatCurrency } from '../lib/valuation';
import { seededPercentChange } from '../lib/history';
import { useComicSearch } from '../lib/useComicSearch';
import { toComicIssue, type SearchedComic } from '../lib/comicSearch';
import type { ComicIssue, GradedSale, RawListing, SavedComic, ValueBand } from '../types/comic';

interface Entry {
  saved: SavedComic;
  issue: ComicIssue;
}

interface IssueBands {
  raw: ValueBand<RawListing> | null;
  graded: ValueBand<GradedSale> | null;
}

/** Stable seed so the collection's illustrative change chip doesn't jitter on re-render. */
const PORTFOLIO_SEED = 'portfolio-total';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Pre-filled from a barcode scan that found no confident catalog match (see ScanBarcodePage).
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [searchOpen, setSearchOpen] = useState(() => initialQuery.length > 0);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const { status: searchStatus, results: searchResults } = useComicSearch(query);
  const { items, isSaved } = useCollection();

  function handleResultClick(comic: SearchedComic) {
    registerDiscoveredIssue(toComicIssue(comic));
    navigate(`/results/${comic.id}`);
  }

  function openSearch() {
    setSearchOpen(true);
    requestAnimationFrame(() => {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('comic-search')?.focus();
    });
  }

  const [valueMap, setValueMap] = useState<Record<string, IssueBands>>({});

  useEffect(() => {
    let active = true;
    const uniqueIssueIds = Array.from(new Set(items.map((i) => i.issueId)));

    Promise.all(
      uniqueIssueIds.map(async (issueId) => {
        const result = await fetchValue(issueId);
        return [issueId, { raw: calculateBand(result.rawListings), graded: calculateBand(result.gradedSales) }] as const;
      }),
    ).then((entries) => {
      if (active) setValueMap(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [items]);

  const enriched = useMemo<Entry[]>(
    () =>
      items
        .map((saved) => ({ saved, issue: getIssueById(saved.issueId) }))
        .filter((e): e is Entry => Boolean(e.issue)),
    [items],
  );

  const recent = useMemo(
    () => [...enriched].sort((a, b) => b.saved.savedAt.localeCompare(a.saved.savedAt)).slice(0, 3),
    [enriched],
  );

  function resolveBand(saved: SavedComic): { low: number; median: number; high: number } | null {
    const bands = valueMap[saved.issueId];
    if (!bands) return null;
    if (saved.isSlabbed) return bands.graded;
    if (!bands.raw) return null;
    return adjustBandForCondition(bands.raw, saved.condition);
  }

  const portfolio = useMemo(() => {
    let medianTotal = 0;
    let lowTotal = 0;
    let highTotal = 0;
    let pricedCount = 0;
    for (const { saved } of enriched) {
      const band = resolveBand(saved);
      if (band) {
        medianTotal += band.median;
        lowTotal += band.low;
        highTotal += band.high;
        pricedCount++;
      }
    }
    return { medianTotal, lowTotal, highTotal, pricedCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enriched, valueMap]);

  const hasHoldings = items.length > 0;
  const hasPricing = portfolio.pricedCount > 0;
  const percentChange = hasPricing ? seededPercentChange(PORTFOLIO_SEED) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
      <p className="font-display text-xl font-semibold text-ink">Welcome</p>

      <Link
        to="/scan/cover"
        className="mt-4 flex items-center gap-4 rounded-2xl bg-brand p-5 text-ink-on-brand hover:bg-brand-dark"
      >
        <CameraIcon />
        <span>
          <span className="block text-base font-semibold">Identify a comic</span>
          <span className="mt-0.5 block text-sm text-ink-on-brand/80">Point your camera at the cover or barcode.</span>
        </span>
      </Link>
      <Link to="/scan/barcode" className="mt-2 block text-center text-xs font-semibold text-ink-soft hover:text-ink">
        Or scan the barcode instead
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={openSearch}
          className="rounded-2xl border border-slate-200 p-3 text-center text-sm font-semibold text-ink hover:border-brand"
        >
          Search by title
        </button>
        <Link
          to="/collection"
          className="flex items-center justify-center rounded-2xl border border-slate-200 p-3 text-center text-sm font-semibold text-ink hover:border-brand"
        >
          My collection
        </Link>
      </div>

      {hasHoldings ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-paper p-4">
          <p className="text-sm font-medium text-ink-soft">Your collection is worth about</p>
          {hasPricing ? (
            <>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-ink">
                  {formatCurrency(portfolio.medianTotal)}
                </span>
                <GainLossPill percent={percentChange} />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                A fair-value estimate from real recent sales · {portfolio.pricedCount} comic
                {portfolio.pricedCount === 1 ? '' : 's'}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">Not enough recent data to price your collection reliably yet.</p>
          )}
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recently checked</h2>
            <Link to="/collection" className="text-xs font-semibold text-brand">
              See all
            </Link>
          </div>

          <div className="mt-2 space-y-2">
            {recent.map(({ saved, issue }) => {
              const cover = saved.personalCoverUrl ?? issue.coverImageUrl;
              const priced = saved.issueId in valueMap;
              const band = resolveBand(saved);

              return (
                <Link
                  key={saved.savedId}
                  to={`/collection/${saved.savedId}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex h-14 w-10 flex-none items-center justify-center overflow-hidden rounded-md bg-brand-soft text-xs font-bold text-brand-dark">
                    {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : issue.issueNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {issue.title} {issue.issueNumber}
                    </p>
                    {issue.note ? <p className="truncate text-xs text-ink-soft">{issue.note}</p> : null}
                  </div>
                  <div className="flex-none text-right">
                    {!priced ? (
                      <span className="text-xs text-ink-soft">Pricing…</span>
                    ) : !band ? (
                      <span className="text-xs text-ink-soft">Not enough data</span>
                    ) : (
                      <>
                        <p className="font-mono text-xs font-semibold text-ink">
                          {formatCurrency(band.low)}–{formatCurrency(band.high)}
                        </p>
                        <GainLossPill percent={seededPercentChange(issue.id)} size="sm" />
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <div ref={searchSectionRef} className="mt-6">
        {searchOpen ? (
          <>
            <p className="text-sm font-semibold text-ink">Search by title</p>
            <div className="mt-2">
              <SearchBar value={query} onChange={setQuery} autoFocus />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Search covers comics from across publishers, powered by the Comic Vine database.
            </p>

            <div className="mt-3">
              {searchStatus === 'idle' ? (
                <EmptyState title="Search any comic" message='Try "Amazing Spider-Man 300", "Saga", or "Spawn".' />
              ) : searchStatus === 'loading' ? (
                <Spinner label="Searching…" />
              ) : searchStatus === 'error' ? (
                <EmptyState title="Search is temporarily unavailable" message="Try again in a moment." />
              ) : searchStatus === 'empty' ? (
                <EmptyState title="No match found" message="Try a different spelling, or search by series only." />
              ) : (
                <ul className="space-y-2">
                  {searchResults.map((comic) => (
                    <li key={comic.id}>
                      <ComicListItem
                        issue={toComicIssue(comic)}
                        to={`/results/${comic.id}`}
                        owned={isSaved(comic.id)}
                        onClick={() => handleResultClick(comic)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 flex-none" aria-hidden="true">
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
