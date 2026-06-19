import { formatCurrency } from '../lib/valuation';
import { GainLossPill } from './GainLossPill';

function relativeDate(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

interface CompsListProps<T extends { price: number; date: string }> {
  items: T[];
  /** Formats the row's leading label, e.g. a raw listing's `.label` or a graded sale's grade/company/sale type. */
  formatLabel(item: T): string;
  /** "Listed" for raw asking entries, "Sold" for graded sales — keeps the honesty distinction visible per-row. */
  dateVerb: 'Listed' | 'Sold';
  /** Limits how many rows render — used to give free users a teaser instead of the full history. */
  limit?: number;
  emptyMessage: string;
  /** When set, shows a per-row gain/loss pill comparing each item's price against this median — only meaningful for sold (not asking) data. */
  referenceMedian?: number;
}

export function CompsList<T extends { price: number; date: string }>({
  items,
  formatLabel,
  dateVerb,
  limit,
  emptyMessage,
  referenceMedian,
}: CompsListProps<T>) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const visible = limit ? sorted.slice(0, limit) : sorted;

  if (visible.length === 0) {
    return <p className="text-sm text-ink-soft">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {visible.map((item, i) => (
        <li key={`${item.date}-${item.price}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
          <div>
            <p className="font-medium text-ink">{formatLabel(item)}</p>
            <p className="text-xs text-ink-soft">
              {dateVerb} {relativeDate(item.date)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-ink">{formatCurrency(item.price)}</p>
            {referenceMedian ? (
              <div className="mt-0.5 flex justify-end">
                <GainLossPill percent={((item.price - referenceMedian) / referenceMedian) * 100} size="sm" />
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
