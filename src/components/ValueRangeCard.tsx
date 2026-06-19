import { Link } from 'react-router-dom';
import type { ValueBand } from '../types/comic';
import { formatCurrency } from '../lib/valuation';

interface ValueRangeCardProps {
  title: string;
  subtitle?: string;
  band: ValueBand | null;
  accent?: 'brand' | 'value';
  locked?: boolean;
}

export function ValueRangeCard({ title, subtitle, band, accent = 'value', locked }: ValueRangeCardProps) {
  const accentText = accent === 'value' ? 'text-value' : 'text-brand-dark';

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
            className="mt-2 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            See plans
          </Link>
        </div>
      ) : band === null ? (
        <p className="mt-2 text-sm text-ink-soft">Not enough recent sales to price reliably.</p>
      ) : (
        <>
          <p className={`mt-1 text-2xl font-bold ${accentText}`}>
            {formatCurrency(band.low)}–{formatCurrency(band.high)}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">Median {formatCurrency(band.median)}</p>
        </>
      )}
    </div>
  );
}
