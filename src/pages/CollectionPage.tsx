import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { ConditionSelector } from '../components/ConditionSelector';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { UpsellCard } from '../components/UpsellCard';
import { useCollection } from '../context/useCollection';
import { useBilling } from '../context/useBilling';
import { getIssueById } from '../data/catalog';
import { fetchComps } from '../services/comps';
import { calculateRawBand, adjustBandForCondition, formatCurrency } from '../lib/valuation';
import type { Condition, SavedComic, ValueBand } from '../types/comic';

interface RowState {
  saved: SavedComic;
  rawBand: ValueBand | null;
  loading: boolean;
}

type PricingEntry = ValueBand | null;

function buildCsv(rows: RowState[]): string {
  const header = 'Title,Issue,Year,Publisher,Condition,Low,Median,High\n';
  const lines = rows.map((row) => {
    const issue = getIssueById(row.saved.issueId);
    if (!issue) return '';
    const band = row.rawBand;
    return [
      issue.title,
      issue.issueNumber,
      issue.year,
      issue.publisher,
      row.saved.condition,
      band?.low ?? '',
      band?.median ?? '',
      band?.high ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
  });
  return header + lines.filter(Boolean).join('\n');
}

export function CollectionPage() {
  const { items, loading: itemsLoading, remove, setCondition } = useCollection();
  const { isPro } = useBilling();
  const [pricing, setPricing] = useState<Record<string, PricingEntry>>({});

  useEffect(() => {
    let active = true;

    Promise.all(
      items.map(async (saved) => {
        const comps = await fetchComps(saved.issueId);
        const trimmed = calculateRawBand(comps.raw);
        const band = trimmed ? adjustBandForCondition(trimmed, saved.condition) : null;
        return [`${saved.savedId}:${saved.condition}`, band] as const;
      }),
    ).then((entries) => {
      if (active) setPricing(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [items]);

  const rows = useMemo<RowState[]>(
    () =>
      items.map((saved) => {
        const key = `${saved.savedId}:${saved.condition}`;
        const isLoading = !(key in pricing);
        return { saved, rawBand: isLoading ? null : pricing[key], loading: isLoading };
      }),
    [items, pricing],
  );

  const total = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (!row.rawBand) return acc;
        return { low: acc.low + row.rawBand.low, high: acc.high + row.rawBand.high };
      },
      { low: 0, high: 0 },
    );
  }, [rows]);

  function handleExport() {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panelworth-collection.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (itemsLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Collection" />
        <Spinner label="Loading your collection…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Collection" />
        <EmptyState
          title="Nothing saved yet"
          message="Scan a cover or barcode, or search for a comic, then add it here to track its value."
          action={
            <Link to="/" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
              Find your first comic
            </Link>
          }
        />
      </div>
    );
  }

  const pricedRows = rows.filter((r) => r.rawBand);
  const hasUnpriced = rows.some((r) => !r.loading && !r.rawBand);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Collection" />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-2xl border border-slate-200 bg-paper p-4">
          <p className="text-sm font-semibold text-ink">Estimated total (raw)</p>
          {pricedRows.length === 0 ? (
            <p className="mt-1 text-sm text-ink-soft">Not enough recent sales to price your collection reliably.</p>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-value">
                {formatCurrency(total.low)}–{formatCurrency(total.high)}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Based on {pricedRows.length} of {rows.length} item{rows.length === 1 ? '' : 's'} with enough sales
                data{hasUnpriced ? '; the rest are excluded from this total.' : '.'}
              </p>
            </>
          )}
        </div>

        {isPro ? (
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-ink hover:border-slate-300"
          >
            Export collection (CSV)
          </button>
        ) : (
          <UpsellCard message="Export your collection to a spreadsheet with PanelWorth Pro." />
        )}

        <ul className="space-y-3">
          {rows.map((row) => (
            <CollectionRow
              key={row.saved.savedId}
              row={row}
              onRemove={() => remove(row.saved.savedId)}
              onConditionChange={(condition) => setCondition(row.saved.savedId, condition)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function CollectionRow({
  row,
  onRemove,
  onConditionChange,
}: {
  row: RowState;
  onRemove(): void;
  onConditionChange(condition: Condition): void;
}) {
  const issue = getIssueById(row.saved.issueId);
  if (!issue) return null;

  return (
    <li className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link to={`/results/${issue.id}`} className="font-semibold text-ink hover:underline">
            {issue.title} {issue.issueNumber}
          </Link>
          <p className="text-xs text-ink-soft">
            {issue.publisher} · {issue.year}
          </p>
          {issue.isKeyIssue ? <div className="mt-1">{<KeyIssueBadge />}</div> : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${issue.title} ${issue.issueNumber} from collection`}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-slate-100 hover:text-danger"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-3">
        <ConditionSelector value={row.saved.condition} onChange={onConditionChange} />
      </div>

      <div className="mt-3">
        {row.loading ? (
          <p className="text-sm text-ink-soft">Pricing…</p>
        ) : row.rawBand ? (
          <p className="text-sm font-semibold text-value">
            {formatCurrency(row.rawBand.low)}–{formatCurrency(row.rawBand.high)}
          </p>
        ) : (
          <p className="text-sm text-ink-soft">Not enough recent sales to price reliably.</p>
        )}
      </div>
    </li>
  );
}
