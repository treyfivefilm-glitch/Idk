import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { OwnedBadge } from '../components/OwnedBadge';
import { ConditionSelector } from '../components/ConditionSelector';
import { ValueRangeCard } from '../components/ValueRangeCard';
import { CompsList } from '../components/CompsList';
import { UpsellCard } from '../components/UpsellCard';
import { HowCalculatedSheet } from '../components/HowCalculatedSheet';
import { AddToCollectionSheet } from '../components/AddToCollectionSheet';
import { TickerCode } from '../components/TickerCode';
import { GainLossPill } from '../components/GainLossPill';
import { AreaChart } from '../components/AreaChart';
import { getIssueById } from '../data/catalog';
import { fetchValue, type ValueResult } from '../services/value';
import {
  calculateBand,
  adjustBandForCondition,
  gradingAdvice,
  formatGradedSaleLabel,
  formatCurrency,
} from '../lib/valuation';
import { ebaySoldListingsUrl, ebayActiveListingsUrl } from '../lib/ebay';
import { FREE_COLLECTION_LIMIT } from '../lib/limits';
import { useBilling } from '../context/useBilling';
import { useCollection } from '../context/useCollection';
import { buildValueHistory, seededPercentChange } from '../lib/history';
import { tickerCode } from '../lib/ticker';
import type { Condition, RawListing } from '../types/comic';

const FREE_COMPS_LIMIT = 3;

const RANGES: { label: '1M' | '3M' | '1Y' | 'ALL'; points: number }[] = [
  { label: '1M', points: 4 },
  { label: '3M', points: 6 },
  { label: '1Y', points: 10 },
  { label: 'ALL', points: 14 },
];

export function ResultsPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const issue = issueId ? getIssueById(issueId) : undefined;
  const { isPro } = useBilling();
  const { items, savedCopiesOf, addItem } = useCollection();

  const [condition, setCondition] = useState<Condition>('good');
  const [valueState, setValueState] = useState<{ issueId: string; data: ValueResult } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [range, setRange] = useState<(typeof RANGES)[number]['label']>('3M');

  useEffect(() => {
    if (!issue) return;
    let active = true;
    fetchValue(issue.id).then((result) => {
      if (active) setValueState({ issueId: issue.id, data: result });
    });
    return () => {
      active = false;
    };
  }, [issue]);

  const loading = !issue || valueState?.issueId !== issue.id;
  const value = issue && valueState?.issueId === issue.id ? valueState.data : null;

  const savedCopies = issue ? savedCopiesOf(issue.id) : [];
  const atLimit = !isPro && items.length >= FREE_COLLECTION_LIMIT;

  const rawBandTrimmed = useMemo(() => (value ? calculateBand(value.rawListings) : null), [value]);
  const gradedBandTrimmed = useMemo(() => (value ? calculateBand(value.gradedSales) : null), [value]);
  const adjustedRaw = rawBandTrimmed ? adjustBandForCondition(rawBandTrimmed, condition) : null;

  async function handleAddConfirm(collectionId: string) {
    if (!issue) return;
    const saved = await addItem(issue.id, collectionId, condition);
    setAddSheetOpen(false);
    navigate(`/collection/${saved.savedId}`);
  }

  if (!issue) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Not found" showBack />
        <EmptyState
          title="We couldn't find that comic"
          message="It may have been removed from the demo catalog. Try a manual search instead."
          action={
            <Link to="/" className="text-sm font-semibold text-brand">
              Back to search
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title={`${issue.title} ${issue.issueNumber}`} showBack />

      <div className="space-y-5 px-4 py-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {issue.title} {issue.issueNumber}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                <TickerCode code={tickerCode(issue)} className="text-sm font-semibold" />
                <span>
                  · {issue.publisher} · {issue.year}
                </span>
              </p>
            </div>
            {issue.isKeyIssue ? <KeyIssueBadge /> : null}
          </div>
          <p className="mt-2 text-sm text-ink-soft">{issue.note}</p>
        </div>

        {savedCopies.length > 0 ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-value-soft px-3 py-2.5">
            <div className="flex items-center gap-2">
              <OwnedBadge />
              <span className="text-xs text-ink-soft">
                {savedCopies.length === 1 ? '1 copy' : `${savedCopies.length} copies`} in your collection
              </span>
            </div>
            <Link to={`/collection/${savedCopies[0].savedId}`} className="text-xs font-semibold text-brand">
              View
            </Link>
          </div>
        ) : null}

        <ConditionSelector value={condition} onChange={setCondition} />

        {loading ? (
          <Spinner label="Pulling recent prices…" />
        ) : (
          <>
            {adjustedRaw ? (
              <div className="rounded-2xl border border-slate-200 bg-paper p-4">
                <div className="flex items-center justify-between gap-2">
                  <TickerCode code={tickerCode(issue)} className="text-xs font-semibold" />
                  <div className="flex gap-1">
                    {RANGES.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => setRange(r.label)}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          range === r.label ? 'bg-brand text-ink-on-brand' : 'text-ink-soft hover:bg-slate-50'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-semibold text-ink">
                    {formatCurrency(adjustedRaw.median)}
                  </span>
                  <GainLossPill percent={seededPercentChange(issue.id)} />
                </div>
                <div className="mt-3">
                  <AreaChart
                    values={buildValueHistory(
                      issue.id,
                      adjustedRaw.low,
                      adjustedRaw.high,
                      RANGES.find((r) => r.label === range)?.points,
                    ).map((p) => (p.low + p.high) / 2)}
                    positive={seededPercentChange(issue.id) >= 0}
                    height={80}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Illustrative — price history is a simulated trend, not yet a record of real period-over-period
                  snapshots.
                </p>
              </div>
            ) : null}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Value range</h3>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="text-xs font-semibold text-brand underline-offset-2 hover:underline"
                >
                  How we calculated this
                </button>
              </div>
              <div className="space-y-3">
                <ValueRangeCard
                  title="Raw — asking price"
                  subtitle="currently listed"
                  band={adjustedRaw}
                  accent="value"
                  emptyMessage="Not enough recent listings for this issue to price reliably."
                />
                <ValueRangeCard
                  title="Graded (CGC/CBCS) — sold price"
                  subtitle="actual sales"
                  band={gradedBandTrimmed}
                  accent="brand"
                  locked={!isPro}
                  emptyMessage="Not enough recent graded sales for this issue to price reliably."
                />
              </div>
            </div>

            {isPro ? (
              <p className="rounded-xl bg-slate-50 p-3 text-xs text-ink-soft">
                {gradingAdvice(rawBandTrimmed, gradedBandTrimmed)}
              </p>
            ) : (
              <UpsellCard message="Unlock graded (CGC/CBCS) estimates and grading guidance with PanelWorth Pro." />
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Currently listed — raw</h3>
              <CompsList
                items={value?.rawListings ?? []}
                formatLabel={(item: RawListing) => item.label}
                dateVerb="Listed"
                limit={isPro ? undefined : FREE_COMPS_LIMIT}
                emptyMessage="No recent raw listings found for this issue."
              />
              {!isPro && (value?.rawListings.length ?? 0) > FREE_COMPS_LIMIT ? (
                <p className="mt-2 text-xs text-ink-soft">
                  Showing {FREE_COMPS_LIMIT} of {value?.rawListings.length} listings.{' '}
                  <Link to="/paywall" className="font-semibold text-brand">
                    Unlock full history
                  </Link>
                </p>
              ) : null}
              <a
                href={ebayActiveListingsUrl(issue.title, issue.issueNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-ink hover:border-slate-300"
              >
                See active listings on eBay
                <ExternalIcon />
              </a>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Recent Trades — graded</h3>
              {isPro ? (
                <CompsList
                  items={value?.gradedSales ?? []}
                  formatLabel={formatGradedSaleLabel}
                  dateVerb="Sold"
                  emptyMessage="No recent graded sales found for this issue."
                  referenceMedian={gradedBandTrimmed?.median}
                />
              ) : (
                <UpsellCard message="Full graded sold-sale history is part of PanelWorth Pro." />
              )}
              <a
                href={ebaySoldListingsUrl(issue.title, issue.issueNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-ink hover:border-slate-300"
              >
                See sold listings on eBay
                <ExternalIcon />
              </a>
            </div>

            {atLimit ? (
              <UpsellCard
                message={`Your free collection is capped at ${FREE_COLLECTION_LIMIT} comics. Go Pro to add more.`}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddSheetOpen(true)}
                className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
              >
                Add to collection
              </button>
            )}
          </>
        )}
      </div>

      <HowCalculatedSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        condition={condition}
        rawBand={rawBandTrimmed}
        gradedBand={gradedBandTrimmed}
        gradedLocked={!isPro}
      />

      <AddToCollectionSheet open={addSheetOpen} onClose={() => setAddSheetOpen(false)} onConfirm={handleAddConfirm} />
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M7 17L17 7M7 7h10v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
