import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { ConditionSelector } from '../components/ConditionSelector';
import { ValueRangeCard } from '../components/ValueRangeCard';
import { CompsList } from '../components/CompsList';
import { UpsellCard } from '../components/UpsellCard';
import { HowCalculatedSheet } from '../components/HowCalculatedSheet';
import { getIssueById } from '../data/catalog';
import { fetchComps, type CompsResult } from '../services/comps';
import { calculateRawBand, adjustBandForCondition, gradingAdvice } from '../lib/valuation';
import { ebaySoldListingsUrl } from '../lib/ebay';
import { useBilling } from '../context/useBilling';
import { useCollection } from '../context/useCollection';
import type { Condition } from '../types/comic';

const FREE_COMPS_LIMIT = 3;

export function ResultsPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const issue = issueId ? getIssueById(issueId) : undefined;
  const { isPro } = useBilling();
  const { items, add, remove, setCondition: persistCondition } = useCollection();

  const [condition, setConditionState] = useState<Condition>('good');
  const [compsState, setCompsState] = useState<{ issueId: string; data: CompsResult } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!issue) return;
    let active = true;
    fetchComps(issue.id).then((result) => {
      if (active) {
        setCompsState({ issueId: issue.id, data: result });
      }
    });
    return () => {
      active = false;
    };
  }, [issue]);

  const loading = !issue || compsState?.issueId !== issue.id;
  const comps = issue && compsState?.issueId === issue.id ? compsState.data : null;

  const savedEntry = issue ? items.find((item) => item.issueId === issue.id) : undefined;

  const rawBandTrimmed = useMemo(() => (comps ? calculateRawBand(comps.raw) : null), [comps]);
  const gradedBandTrimmed = useMemo(() => (comps ? calculateRawBand(comps.graded) : null), [comps]);

  const adjustedRaw = rawBandTrimmed ? adjustBandForCondition(rawBandTrimmed, condition) : null;
  const adjustedGraded = gradedBandTrimmed ? adjustBandForCondition(gradedBandTrimmed, condition) : null;

  function handleConditionChange(next: Condition) {
    setConditionState(next);
    if (savedEntry) {
      persistCondition(savedEntry.savedId, next);
    }
  }

  function handleSaveToggle() {
    if (!issue) return;
    if (savedEntry) {
      remove(savedEntry.savedId);
    } else {
      add(issue.id, condition);
    }
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
              <p className="text-sm text-ink-soft">
                {issue.publisher} · {issue.year}
              </p>
            </div>
            {issue.isKeyIssue ? <KeyIssueBadge /> : null}
          </div>
          <p className="mt-2 text-sm text-ink-soft">{issue.note}</p>
        </div>

        <ConditionSelector value={condition} onChange={handleConditionChange} />

        {loading ? (
          <Spinner label="Pulling recent sold prices…" />
        ) : (
          <>
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
                <ValueRangeCard title="Raw (ungraded)" band={adjustedRaw} accent="value" />
                <ValueRangeCard title="Graded (CGC/CBCS)" band={adjustedGraded} accent="brand" locked={!isPro} />
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
              <h3 className="mb-2 text-sm font-semibold text-ink">Recent sold listings — raw</h3>
              <CompsList comps={comps?.raw ?? []} limit={isPro ? undefined : FREE_COMPS_LIMIT} />
              {!isPro && (comps?.raw.length ?? 0) > FREE_COMPS_LIMIT ? (
                <p className="mt-2 text-xs text-ink-soft">
                  Showing {FREE_COMPS_LIMIT} of {comps?.raw.length} sales.{' '}
                  <Link to="/paywall" className="font-semibold text-brand">
                    Unlock full history
                  </Link>
                </p>
              ) : null}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Recent sold listings — graded</h3>
              {isPro ? (
                <CompsList comps={comps?.graded ?? []} />
              ) : (
                <UpsellCard message="Full graded sold-listing history is part of PanelWorth Pro." />
              )}
            </div>

            <a
              href={ebaySoldListingsUrl(issue.title, issue.issueNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-ink hover:border-slate-300"
            >
              See sold listings on eBay
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M7 17L17 7M7 7h10v10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={handleSaveToggle}
              className={`w-full rounded-xl py-3 text-sm font-semibold ${
                savedEntry
                  ? 'border border-slate-200 text-ink hover:border-slate-300'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}
            >
              {savedEntry ? 'Remove from collection' : 'Add to collection'}
            </button>
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
    </div>
  );
}
