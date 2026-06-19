import { buildValueHistory } from '../lib/history';
import { formatCurrency } from '../lib/valuation';
import { ValueHistorySparkline } from './ValueHistorySparkline';
import { UpsellCard } from './UpsellCard';

interface ValueSummaryCardProps {
  seedKey: string;
  low: number;
  high: number;
  pricedCount: number;
  totalCount: number;
  isPro: boolean;
}

export function ValueSummaryCard({ seedKey, low, high, pricedCount, totalCount, isPro }: ValueSummaryCardProps) {
  const hasPricing = pricedCount > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-paper p-4">
      <p className="text-sm font-semibold text-ink">Estimated collection value</p>
      {hasPricing ? (
        <p className="mt-1 text-2xl font-bold text-value">
          {formatCurrency(low)}–{formatCurrency(high)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">Not enough recent data to price this collection reliably.</p>
      )}
      <p className="mt-0.5 text-xs text-ink-soft">
        Based on {pricedCount} of {totalCount} item{totalCount === 1 ? '' : 's'} with enough recent data
        {pricedCount < totalCount ? '; the rest are excluded from this total.' : '.'}
      </p>

      {!isPro ? (
        <div className="mt-3">
          <UpsellCard message="Track your collection's value over time with PanelWorth Pro." />
        </div>
      ) : hasPricing ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <ValueHistorySparkline points={buildValueHistory(seedKey, low, high)} />
          <p className="mt-1 text-xs text-ink-soft">
            Illustrative — we'll start tracking your collection's real value from today onward.
          </p>
        </div>
      ) : null}
    </div>
  );
}
