import type { SoldComp } from '../types/comic';
import { formatCurrency } from '../lib/valuation';

function relativeDate(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

interface CompsListProps {
  comps: SoldComp[];
  /** Limits how many rows render — used to give free users a teaser instead of the full history. */
  limit?: number;
}

export function CompsList({ comps, limit }: CompsListProps) {
  const sorted = [...comps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const visible = limit ? sorted.slice(0, limit) : sorted;

  if (visible.length === 0) {
    return <p className="text-sm text-ink-soft">No recent sold listings found for this issue yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {visible.map((comp, i) => (
        <li key={`${comp.date}-${comp.price}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
          <div>
            <p className="font-medium text-ink">{comp.label}</p>
            <p className="text-xs text-ink-soft">Sold {relativeDate(comp.date)}</p>
          </div>
          <p className="font-semibold text-ink">{formatCurrency(comp.price)}</p>
        </li>
      ))}
    </ul>
  );
}
