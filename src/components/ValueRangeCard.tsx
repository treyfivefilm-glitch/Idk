import { Link } from 'react-router-dom';
import type { ValueBand } from '../types/comic';
import { formatCurrency } from '../lib/valuation';

interface ValueRangeCardProps<T extends { price: number }> {
  title: string;
  subtitle?: string;
  band: ValueBand<T> | null;
  accent?: 'brand' | 'value';
  locked?: boolean;
  emptyMessage?: string;
  /** One honest sentence about the sample behind the number, e.g. "Based on 6 real sales in the last 90 days." */
  note?: string;
}

export function ValueRangeCard<T extends { price: number }>({
  title,
  subtitle,
  band,
  accent = 'value',
  locked,
  emptyMessage = 'Not enough recent data to price reliably.',
  note,
}: ValueRangeCardProps<T>) {
  const accentText = accent === 'value' ? 'text-value' : 'text-brand-dark';
  const markerPercent =
    band && band.high > band.low
      ? Math.min(96, Math.max(4, ((band.median - band.low) / (band.high - band.low)) * 100))
      : 50;

  return (
    <div className="rounded-2xl border border-slate-200 bg-paper p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle ? <span className="text-xs text-ink-soft">{subtitle}</span> : null}
      </div>

      {locked ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-sm text-ink-soft">Graded estimates are part of PanelWorth Pro.</p>
          <Link
            to="/paywall"
            className="mt-2 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
          >
            See plans
          </Link>
        </div>
      ) : band === null ? (
        <p className="mt-2 text-sm text-ink-soft">{emptyMessage}</p>
      ) : (
        <>
          <p className={`mt-1 text-2xl font-bold ${accentText}`}>
            {formatCurrency(band.low)}–{formatCurrency(band.high)}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">Median {formatCurrency(band.median)}</p>

          <div className={`mt-3 relative h-1.5 rounded-full bg-slate-100 ${accentText}`}>
            <div
              className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-current"
              style={{ left: `${markerPercent}%` }}
            />
          </div>

          {note ? <p className="mt-2 text-xs text-ink-soft">{note}</p> : null}
        </>
      )}
    </div>
  );
}
