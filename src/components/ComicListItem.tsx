import { Link } from 'react-router-dom';
import type { ComicIssue } from '../types/comic';
import { KeyIssueBadge } from './KeyIssueBadge';
import { OwnedBadge } from './OwnedBadge';
import { TickerCode } from './TickerCode';
import { tickerCode } from '../lib/ticker';

interface ComicListItemProps {
  issue: ComicIssue;
  to: string;
  right?: React.ReactNode;
  /** Shows an "in your collection" badge — used to surface the duplicate-saver check in search/scan results. */
  owned?: boolean;
}

export function ComicListItem({ issue, to, right, owned }: ComicListItemProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-14 w-10 flex-none items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-dark">
        {issue.issueNumber}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {issue.title} {issue.issueNumber}
        </p>
        <p className="truncate text-xs text-ink-soft">
          <TickerCode code={tickerCode(issue)} /> · {issue.publisher} · {issue.year}
        </p>
        {issue.isKeyIssue || owned ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {issue.isKeyIssue ? <KeyIssueBadge /> : null}
            {owned ? <OwnedBadge /> : null}
          </div>
        ) : null}
      </div>
      {right}
    </Link>
  );
}
