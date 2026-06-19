import { BottomSheet } from './BottomSheet';
import type { Condition, ValueBand } from '../types/comic';
import { CONDITION_MULTIPLIERS, formatCurrency } from '../lib/valuation';
import { CONDITIONS } from '../types/comic';

interface HowCalculatedSheetProps {
  open: boolean;
  onClose(): void;
  condition: Condition;
  rawBand: ValueBand | null;
  gradedBand: ValueBand | null;
  gradedLocked?: boolean;
}

function BandBreakdown({ label, band, condition }: { label: string; band: ValueBand | null; condition: Condition }) {
  if (!band) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <p className="mt-1 text-sm text-ink-soft">Not enough recent sales to price reliably.</p>
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
            <span>{comp.label} (excluded as outlier)</span>
            <span>{formatCurrency(comp.price)}</span>
          </li>
        ))}
        {band.usedComps.map((comp, i) => (
          <li key={`used-${i}`} className="flex justify-between text-ink">
            <span>{comp.label}</span>
            <span>{formatCurrency(comp.price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink-soft">
        Remaining range {formatCurrency(band.low)}–{formatCurrency(band.high)}, median {formatCurrency(band.median)},
        × {multiplier.toFixed(2)} for "{conditionLabel}" condition.
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
        <li>We start from recent SOLD prices — never asking prices.</li>
        <li>We drop the single highest and single lowest sale, since those are usually outliers.</li>
        <li>We report the low–high range and median of what's left.</li>
        <li>We adjust that range for the condition you selected.</li>
        <li>Raw and professionally-graded (CGC/CBCS) sales are kept separate, since grading changes value a lot.</li>
      </ol>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        <BandBreakdown label="Raw" band={rawBand} condition={condition} />
        {gradedLocked ? (
          <div>
            <h3 className="text-sm font-semibold text-ink">Graded (CGC/CBCS)</h3>
            <p className="mt-1 text-sm text-ink-soft">The graded breakdown is part of PanelWorth Pro.</p>
          </div>
        ) : (
          <BandBreakdown label="Graded (CGC/CBCS)" band={gradedBand} condition={condition} />
        )}
      </div>
    </BottomSheet>
  );
}
