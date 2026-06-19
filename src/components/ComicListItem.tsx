import { Link } from 'react-router-dom';
import type { ComicIssue } from '../types/comic';
import { KeyIssueBadge } from './KeyIssueBadge';

interface ComicListItemProps {
  issue: ComicIssue;
  to: string;
  right?: React.ReactNode;
}

export function ComicListItem({ issue, to, right }: ComicListItemProps) {
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
          {issue.publisher} · {issue.year}
        </p>
        {issue.isKeyIssue ? <div className="mt-1">{<KeyIssueBadge />}</div> : null}
      </div>
      {right}
    </Link>
  );
}
