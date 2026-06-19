import { BottomSheet } from './BottomSheet';
import type { Condition, GradedSale, RawListing, ValueBand } from '../types/comic';
import { CONDITION_MULTIPLIERS, formatCurrency, formatGradedSaleLabel } from '../lib/valuation';
import { CONDITIONS } from '../types/comic';

interface HowCalculatedSheetProps {
  open: boolean;
  onClose(): void;
  condition: Condition;
  rawBand: ValueBand<RawListing> | null;
  gradedBand: ValueBand<GradedSale> | null;
  gradedLocked?: boolean;
}

function BandBreakdown<T extends { price: number }>({
  label,
  band,
  condition,
  formatLabel,
  adjustForCondition,
}: {
  label: string;
  band: ValueBand<T> | null;
  condition: Condition;
  formatLabel(item: T): string;
  adjustForCondition: boolean;
}) {
  if (!band) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <p className="mt-1 text-sm text-ink-soft">Not enough recent data to price reliably.</p>
      </div>
    );
  }

  const multiplier = CONDITION_MULTIPLIERS[condition];
  const conditionLabel = CONDITIONS.find((c) => c.value === condition)?.label ?? condition;

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{label}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {band.excludedComps.map((comp, i) => (
          <li key={`excluded-${i}`} className="flex justify-between text-ink-soft line-through">
            <span>{formatLabel(comp)} (excluded as outlier)</span>
            <span>{formatCurrency(comp.price)}</span>
          </li>
        ))}
        {band.usedComps.map((comp, i) => (
          <li key={`used-${i}`} className="flex justify-between text-ink">
            <span>{formatLabel(comp)}</span>
            <span>{formatCurrency(comp.price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink-soft">
        Remaining range {formatCurrency(band.low)}–{formatCurrency(band.high)}, median {formatCurrency(band.median)}
        {adjustForCondition ? `, × ${multiplier.toFixed(2)} for "${conditionLabel}" condition.` : '.'}
      </p>
    </div>
  );
}

export function HowCalculatedSheet({
  open,
  onClose,
  condition,
  rawBand,
  gradedBand,
  gradedLocked,
}: HowCalculatedSheetProps) {
  return (
    <BottomSheet open={open} title="How we calculated this" onClose={onClose}>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
        <li>
          Raw comes from currently-LISTED asking prices (eBay doesn't release sold raw data to new developers);
          graded comes from actual SOLD sales (GoCollect). We never blend the two into one number.
        </li>
        <li>We drop the single highest and single lowest entry, since those are usually outliers.</li>
        <li>We report the low–high range and median of what's left.</li>
        <li>
          We adjust the raw range for the condition you selected. Graded copies carry a certified grade already, so
          condition doesn't apply to that range.
        </li>
      </ol>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        <BandBreakdown
          label="Raw — asking price"
          band={rawBand}
          condition={condition}
          formatLabel={(item: RawListing) => item.label}
          adjustForCondition
        />
        {gradedLocked ? (
          <div>
            <h3 className="text-sm font-semibold text-ink">Graded (CGC/CBCS) — sold price</h3>
            <p className="mt-1 text-sm text-ink-soft">The graded breakdown is part of PanelWorth Pro.</p>
          </div>
        ) : (
          <BandBreakdown
            label="Graded (CGC/CBCS) — sold price"
            band={gradedBand}
            condition={condition}
            formatLabel={formatGradedSaleLabel}
            adjustForCondition={false}
          />
        )}
      </div>
    </BottomSheet>
  );
}
