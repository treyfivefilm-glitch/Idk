import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { TickerCode } from '../components/TickerCode';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { CATALOG } from '../data/catalog';
import { seededPercentChange } from '../lib/history';
import { tickerCode } from '../lib/ticker';
import type { ComicIssue } from '../types/comic';

type MoversTab = 'gainers' | 'keys' | 'new';

const TABS: { value: MoversTab; label: string }[] = [
  { value: 'gainers', label: 'Gainers' },
  { value: 'keys', label: 'All keys' },
  { value: 'new', label: 'New' },
];

/** Real count of graded sales recorded in the last 7 days — not seeded/fabricated. */
function salesThisWeek(issue: ComicIssue): number {
  const cutoff = Date.now() - 7 * 86_400_000;
  return issue.gradedSales.filter((s) => new Date(s.date).getTime() >= cutoff).length;
}

export function MarketMoversPage() {
  const [tab, setTab] = useState<MoversTab>('gainers');

  const rows = useMemo(() => {
    const list = tab === 'keys' ? CATALOG.filter((i) => i.isKeyIssue) : [...CATALOG];
    if (tab === 'new') {
      list.sort((a, b) => b.year - a.year);
    } else {
      list.sort((a, b) => seededPercentChange(b.id) - seededPercentChange(a.id));
    }
    return list;
  }, [tab]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Market Movers" />

      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-ink-soft">This week's biggest key-issue gains.</p>

        <div className="flex gap-2" role="tablist" aria-label="Market Movers view">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`flex-none rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.value
                  ? 'bg-brand text-ink-on-brand'
                  : 'border border-slate-200 text-ink-soft hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {rows.map((issue, i) => {
            const percent = seededPercentChange(issue.id);
            const positive = percent >= 0;
            const sales = salesThisWeek(issue);
            return (
              <li key={issue.id}>
                <Link
                  to={`/results/${issue.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className="w-5 flex-none text-center font-mono text-sm font-semibold text-ink-soft">
                    {i + 1}
                  </span>
                  <div className="flex h-12 w-9 flex-none items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand-dark">
                    {issue.issueNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {issue.title} {issue.issueNumber}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <TickerCode code={tickerCode(issue)} className="text-xs" />
                      {issue.isKeyIssue ? <KeyIssueBadge /> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {sales} sale{sales === 1 ? '' : 's'} this week
                    </p>
                  </div>
                  <div className="flex-none text-right">
                    <p className={`font-display text-lg font-bold ${positive ? 'text-gain' : 'text-loss'}`}>
                      {positive ? '▲' : '▼'} {Math.abs(percent).toFixed(1)}%
                    </p>
                    <p className="font-mono text-[10px] text-ink-soft">vs last wk</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-ink-soft">
          Illustrative — weekly % change is a simulated trend; sales counts reflect real recent graded sales in our
          demo catalog.
        </p>
      </div>
    </div>
  );
}
