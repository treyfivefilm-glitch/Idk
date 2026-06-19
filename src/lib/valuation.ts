import type { Condition, SoldComp, ValueBand } from '../types/comic';

/**
 * Below this many recent sales, trimming an outlier on each end leaves too
 * little signal to call the result reliable — we refuse to guess instead.
 */
export const MIN_SALES_FOR_RELIABLE_PRICING = 4;

/** Condition shifts the band around the "good shape" baseline that recent sales already reflect. */
export const CONDITION_MULTIPLIERS: Record<Condition, number> = {
  worn: 0.6,
  good: 1.0,
  likeNew: 1.35,
};

function round(value: number): number {
  return Math.round(value);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Core honesty rule: drop the single highest and single lowest sale (likely
 * outliers — misgraded listings, bundle deals, panic sales), then report the
 * low–high band and median of what's left. Returns null when there isn't
 * enough recent data to do this reliably — callers must show that, not a number.
 */
export function calculateRawBand(comps: SoldComp[]): ValueBand | null {
  if (comps.length < MIN_SALES_FOR_RELIABLE_PRICING) {
    return null;
  }

  const sorted = [...comps].sort((a, b) => a.price - b.price);
  const excludedComps = [sorted[0], sorted[sorted.length - 1]];
  const usedComps = sorted.slice(1, -1);
  const prices = usedComps.map((c) => c.price);

  return {
    low: Math.min(...prices),
    high: Math.max(...prices),
    median: median(prices),
    usedComps,
    excludedComps,
  };
}

/** Applies the condition multiplier to an already-trimmed band and re-rounds every figure. */
export function adjustBandForCondition(band: ValueBand, condition: Condition): ValueBand {
  const multiplier = CONDITION_MULTIPLIERS[condition];
  return {
    ...band,
    low: round(band.low * multiplier),
    median: round(band.median * multiplier),
    high: round(band.high * multiplier),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyRange(low: number, high: number): string {
  return `${formatCurrency(low)}–${formatCurrency(high)}`;
}

const GRADING_COST_LOW = 20;
const GRADING_COST_HIGH = 50;

/**
 * Heuristic, plainly-labeled guidance (not a guarantee): is the typical
 * $20-50+ cost and multi-week wait for professional grading likely worth it
 * for this issue, based on the gap between raw and graded sale prices?
 */
export function gradingAdvice(rawBand: ValueBand | null, gradedBand: ValueBand | null): string {
  if (!gradedBand) {
    return 'Not enough recent graded sales for this issue to compare — grading economics are unclear here.';
  }
  if (!rawBand) {
    return `Graded copies of this issue have sold for ${formatCurrencyRange(
      gradedBand.low,
      gradedBand.high,
    )}. Professional grading typically costs $${GRADING_COST_LOW}–$${GRADING_COST_HIGH}+ and takes several weeks.`;
  }

  const gap = gradedBand.low - rawBand.high;
  const worthwhile = gap > GRADING_COST_HIGH * 1.5;

  if (worthwhile) {
    return `Graded copies have sold for noticeably more than raw ones (about ${formatCurrency(
      gap,
    )} more at the low end). Grading costs $${GRADING_COST_LOW}–$${GRADING_COST_HIGH}+ and takes weeks, but for a sharp copy of this issue it may be worth it.`;
  }
  return `The gap between raw and graded sale prices is small for this issue. Since grading costs $${GRADING_COST_LOW}–$${GRADING_COST_HIGH}+ and takes weeks, it's likely only worth it for an exceptional copy.`;
}
