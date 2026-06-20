import { Link } from 'react-router-dom';
import type { ComicIssue, SavedComic } from '../types/comic';
import { CONDITIONS } from '../types/comic';
import { KeyIssueBadge } from './KeyIssueBadge';
import { TickerCode } from './TickerCode';
import { GainLossPill } from './GainLossPill';
import { ValueHistorySparkline } from './ValueHistorySparkline';
import { formatCurrency } from '../lib/valuation';
import { buildValueHistory } from '../lib/history';
import { tickerCode } from '../lib/ticker';

export interface FlatBand {
  low: number;
  median: number;
  high: number;
}

interface HoldingListRowProps {
  saved: SavedComic;
  issue: ComicIssue;
  band: FlatBand | null;
  loading: boolean;
  percentChange: number;
}

function gradeChip(saved: SavedComic): string {
  if (saved.isSlabbed) {
    return saved.gradingCompany && saved.grade != null
      ? `${saved.gradingCompany} ${saved.grade.toFixed(1)}`
      : 'Graded';
  }
  return CONDITIONS.find((c) => c.value === saved.condition)?.label ?? saved.condition;
}

export function HoldingListRow({ saved, issue, band, loading, percentChange }: HoldingListRowProps) {
  const cover = saved.personalCoverUrl ?? issue.coverImageUrl;
  const history = band ? buildValueHistory(issue.id, band.low, band.high) : [];

  return (
    <Link
      to={`/collection/${saved.savedId}`}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-12 w-9 flex-none items-center justify-center overflow-hidden rounded-md bg-brand-soft text-[10px] font-bold text-brand-dark">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : issue.issueNumber}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {issue.title} {issue.issueNumber}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <TickerCode code={tickerCode(issue)} className="text-xs" />
          <span className="truncate text-xs text-ink-soft">{gradeChip(saved)}</span>
          {issue.isKeyIssue ? <KeyIssueBadge /> : null}
        </div>
      </div>

      <div className="w-12 flex-none">
        <ValueHistorySparkline points={history} height={28} />
      </div>

      <div className="flex-none text-right">
        {loading ? (
          <span className="text-xs text-ink-soft">Pricing…</span>
        ) : !band ? (
          <span className="text-xs text-ink-soft">Not enough data</span>
        ) : (
          <>
            <p className="font-mono text-sm font-semibold text-ink">{formatCurrency(band.median)}</p>
            <GainLossPill percent={percentChange} size="sm" />
          </>
        )}
      </div>
    </Link>
  );
}
