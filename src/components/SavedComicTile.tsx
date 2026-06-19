import { Link } from 'react-router-dom';
import type { ComicIssue, SavedComic } from '../types/comic';
import { CONDITIONS } from '../types/comic';
import { KeyIssueBadge } from './KeyIssueBadge';
import { formatCurrency } from '../lib/valuation';

export interface FlatBand {
  low: number;
  median: number;
  high: number;
}

interface SavedComicTileProps {
  saved: SavedComic;
  issue: ComicIssue;
  view: 'list' | 'card';
  band: FlatBand | null;
  loading: boolean;
}

function gradeChip(saved: SavedComic): string {
  if (saved.isSlabbed) {
    return saved.gradingCompany && saved.grade != null
      ? `${saved.gradingCompany} ${saved.grade.toFixed(1)}`
      : 'Graded';
  }
  return CONDITIONS.find((c) => c.value === saved.condition)?.label ?? saved.condition;
}

function ValueText({ band, loading }: { band: FlatBand | null; loading: boolean }) {
  if (loading) return <span className="text-xs text-ink-soft">Pricing…</span>;
  if (!band) return <span className="text-xs text-ink-soft">Not enough data</span>;
  return (
    <span className="text-sm font-semibold text-value">
      {formatCurrency(band.low)}–{formatCurrency(band.high)}
    </span>
  );
}

export function SavedComicTile({ saved, issue, view, band, loading }: SavedComicTileProps) {
  const cover = saved.personalCoverUrl;

  if (view === 'card') {
    return (
      <Link
        to={`/collection/${saved.savedId}`}
        className="flex flex-col overflow-hidden rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50"
      >
        <div className="flex h-28 items-center justify-center bg-brand-soft text-brand-dark">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold">{issue.issueNumber}</span>
          )}
        </div>
        <div className="p-2.5">
          <p className="truncate text-sm font-semibold text-ink">
            {issue.title} {issue.issueNumber}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">{gradeChip(saved)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {issue.isKeyIssue ? <KeyIssueBadge /> : null}
          </div>
          <div className="mt-1.5">
            <ValueText band={band} loading={loading} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
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
        <p className="truncate text-xs text-ink-soft">
          {gradeChip(saved)} · {issue.publisher}
        </p>
        {issue.isKeyIssue ? (
          <div className="mt-1">
            <KeyIssueBadge />
          </div>
        ) : null}
      </div>
      <div className="flex-none text-right">
        <ValueText band={band} loading={loading} />
      </div>
    </Link>
  );
}
