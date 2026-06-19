import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ComicListItem } from '../components/ComicListItem';
import { EmptyState } from '../components/EmptyState';
import { AreaChart } from '../components/AreaChart';
import { GainLossPill } from '../components/GainLossPill';
import { TickerCode } from '../components/TickerCode';
import { HoldingRow } from '../components/HoldingRow';
import { searchCatalog, getIssueById } from '../data/catalog';
import { useCollection } from '../context/useCollection';
import { fetchValue } from '../services/value';
import { calculateBand, adjustBandForCondition, formatCurrency } from '../lib/valuation';
import { buildValueHistory, seededPercentChange } from '../lib/history';
import { tickerCode } from '../lib/ticker';
import type { ComicIssue, GradedSale, RawListing, SavedComic, ValueBand } from '../types/comic';

interface Entry {
  saved: SavedComic;
  issue: ComicIssue;
}

interface IssueBands {
  raw: ValueBand<RawListing> | null;
  graded: ValueBand<GradedSale> | null;
}

/** Stable seed so the portfolio's illustrative trend/gain chip don't jitter on re-render. */
const PORTFOLIO_SEED = 'portfolio-total';

export function HomePage() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCatalog(query), [query]);
  const { items, isSaved } = useCollection();

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
    () => [...enriched].sort((a, b) => b.saved.savedAt.localeCompare(a.saved.savedAt)).slice(0, 5),
    [enriched],
  );

  function resolveMedian(saved: SavedComic): number | null {
    const bands = valueMap[saved.issueId];
    if (!bands) return null;
    if (saved.isSlabbed) return bands.graded ? bands.graded.median : null;
    return bands.raw ? adjustBandForCondition(bands.raw, saved.condition).median : null;
  }

  function resolveRange(saved: SavedComic): { low: number; high: number } | null {
    const bands = valueMap[saved.issueId];
    if (!bands) return null;
    if (saved.isSlabbed) return bands.graded ? { low: bands.graded.low, high: bands.graded.high } : null;
    if (!bands.raw) return null;
    const adjusted = adjustBandForCondition(bands.raw, saved.condition);
    return { low: adjusted.low, high: adjusted.high };
  }

  const portfolio = useMemo(() => {
    let medianTotal = 0;
    let lowTotal = 0;
    let highTotal = 0;
    let pricedCount = 0;
    for (const { saved } of enriched) {
      const median = resolveMedian(saved);
      const range = resolveRange(saved);
      if (median != null && range) {
        medianTotal += median;
        lowTotal += range.low;
        highTotal += range.high;
        pricedCount++;
      }
    }
    return { medianTotal, lowTotal, highTotal, pricedCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enriched, valueMap]);

  const hasHoldings = items.length > 0;
  const hasPricing = portfolio.pricedCount > 0;
  const percentChange = hasPricing ? seededPercentChange(PORTFOLIO_SEED) : 0;
  const chartValues = hasPricing
    ? buildValueHistory(PORTFOLIO_SEED, portfolio.lowTotal, portfolio.highTotal).map((p) => (p.low + p.high) / 2)
    : [];

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-ink-on-brand">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M5 4h11l3 3v13H5V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-display text-lg font-bold text-ink">PanelWorth</span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">Find out what your comics are actually worth — honestly.</p>

      {hasHoldings ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-paper p-4">
          <p className="text-sm font-medium text-ink-soft">Portfolio value</p>
          {hasPricing ? (
            <>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-ink">
                  {formatCurrency(portfolio.medianTotal)}
                </span>
                <GainLossPill percent={percentChange} />
              </div>
              <p className="mt-0.5 font-mono text-xs text-ink-soft">
                Range {formatCurrency(portfolio.lowTotal)}–{formatCurrency(portfolio.highTotal)}
              </p>
              <div className="mt-3">
                <AreaChart values={chartValues} positive={percentChange >= 0} height={72} />
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Illustrative — we'll start tracking your collection's real value from today onward.
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
            <h2 className="text-sm font-semibold text-ink">Tracked issues</h2>
            <Link to="/collection" className="text-xs font-semibold text-brand">
              See all
            </Link>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {recent.map(({ saved, issue }) => (
              <Link
                key={saved.savedId}
                to={`/collection/${saved.savedId}`}
                className="flex flex-none flex-col gap-1 rounded-xl border border-slate-200 bg-paper px-3 py-2"
              >
                <TickerCode code={tickerCode(issue)} className="text-xs font-semibold" />
                <GainLossPill percent={seededPercentChange(issue.id)} size="sm" />
              </Link>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {recent.map(({ saved, issue }) => (
              <HoldingRow
                key={saved.savedId}
                saved={saved}
                issue={issue}
                median={resolveMedian(saved)}
                percentChange={seededPercentChange(issue.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

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
                <ComicListItem issue={issue} to={`/results/${issue.id}`} owned={isSaved(issue.id)} />
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
