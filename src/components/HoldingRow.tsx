import { Link } from 'react-router-dom';
import type { ComicIssue, SavedComic } from '../types/comic';
import { tickerCode } from '../lib/ticker';
import { formatCurrency } from '../lib/valuation';
import { TickerCode } from './TickerCode';
import { GainLossPill } from './GainLossPill';

interface HoldingRowProps {
  saved: SavedComic;
  issue: ComicIssue;
  median: number | null;
  percentChange: number;
}

export function HoldingRow({ saved, issue, median, percentChange }: HoldingRowProps) {
  return (
    <Link
      to={`/collection/${saved.savedId}`}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-12 w-9 flex-none items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand">
        {issue.issueNumber}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{issue.title}</p>
        <TickerCode code={tickerCode(issue)} className="text-xs" />
      </div>
      <div className="flex-none text-right">
        <p className="font-mono text-sm font-semibold text-ink">{median != null ? formatCurrency(median) : '—'}</p>
        <GainLossPill percent={percentChange} size="sm" />
      </div>
    </Link>
  );
}
