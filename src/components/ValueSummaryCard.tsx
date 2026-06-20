import { buildValueHistory, seededPercentChange } from '../lib/history';
import { formatCurrency } from '../lib/valuation';
import { GainLossPill } from './GainLossPill';
import { ValueHistorySparkline } from './ValueHistorySparkline';
import { UpsellCard } from './UpsellCard';

interface ValueSummaryCardProps {
  seedKey: string;
  medianTotal: number;
  low: number;
  high: number;
  pricedCount: number;
  totalCount: number;
  isPro: boolean;
}

export function ValueSummaryCard({
  seedKey,
  medianTotal,
  low,
  high,
  pricedCount,
  totalCount,
  isPro,
}: ValueSummaryCardProps) {
  const hasPricing = pricedCount > 0;
  const percentChange = hasPricing ? seededPercentChange(seedKey) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-paper p-4">
      <p className="text-sm font-medium text-ink-soft">Worth about</p>
      {hasPricing ? (
        <>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-ink">{formatCurrency(medianTotal)}</span>
            <GainLossPill percent={percentChange} />
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {pricedCount} comic{pricedCount === 1 ? '' : 's'} · fair-value estimate from recent sales
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">
          Not enough recent data to price {totalCount === 1 ? 'this comic' : 'this collection'} reliably yet.
        </p>
      )}

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
