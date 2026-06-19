import type { Condition, GradedSale, RawListing, ValueBand } from '../types/comic';

/**
 * Below this many recent comps, trimming an outlier on each end leaves too
 * little signal to call the result reliable — we refuse to guess instead.
 */
export const MIN_SAMPLE_SIZE = 4;

/** Condition shifts the band around the "good shape" baseline recent raw asking prices already reflect. */
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
 * Core honesty rule: drop the single highest and single lowest comp (likely
 * outliers — misgraded listings, bundle deals, panic sales), then report the
 * low–high band and median of what's left. The same trimming logic serves
 * both raw ASKING listings and graded SOLD sales — only the input array
 * differs, never the math. Returns null when there isn't enough recent data
 * to do this reliably — callers must show that, not a number.
 */
export function calculateBand<T extends { price: number }>(comps: T[]): ValueBand<T> | null {
  if (comps.length < MIN_SAMPLE_SIZE) {
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

/**
 * Applies the condition multiplier to an already-trimmed band and re-rounds
 * every figure. Only meaningful for raw bands — a slabbed copy's value comes
 * from the graded band as-is (see ComicDetailPage), since condition is
 * already captured by the certified grade.
 */
export function adjustBandForCondition<T extends { price: number }>(
  band: ValueBand<T>,
  condition: Condition,
): ValueBand<T> {
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

/** Human label for a graded sale, e.g. "CGC 9.4 · auction". A `RawListing` already carries its own `.label`. */
export function formatGradedSaleLabel(sale: GradedSale): string {
  return `${sale.gradingCompany} ${sale.grade.toFixed(1)} · ${sale.saleType}`;
}

const GRADING_COST_LOW = 20;
const GRADING_COST_HIGH = 50;

/**
 * Heuristic, plainly-labeled guidance (not a guarantee): is the typical
 * $20–50+ cost and multi-week wait for professional grading likely worth it?
 * Compares the raw ASKING band (what ungraded copies are listed for right
 * now) against the graded SOLD band (what graded copies have actually closed
 * for) — an imperfect, asking-vs-sold comparison, kept honestly labeled
 * rather than presented as apples-to-apples.
 */
export function gradingAdvice(
  rawBand: ValueBand<RawListing> | null,
  gradedBand: ValueBand<GradedSale> | null,
): string {
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
    return `Graded copies have sold for noticeably more than raw copies are currently asking (about ${formatCurrency(
      gap,
    )} more at the low end). Grading costs $${GRADING_COST_LOW}–$${GRADING_COST_HIGH}+ and takes weeks, but for a sharp copy of this issue it may be worth it.`;
  }
  return `The gap between current raw asking prices and graded sale prices is small for this issue. Since grading costs $${GRADING_COST_LOW}–$${GRADING_COST_HIGH}+ and takes weeks, it's likely only worth it for an exceptional copy.`;
}
