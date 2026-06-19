/** Plain-language condition tiers shown to users (kept simple — no grading jargon). */
export type Condition = 'worn' | 'good' | 'likeNew';

export const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: 'worn', label: 'Well-worn', hint: 'Creases, tears, heavy shelf wear' },
  { value: 'good', label: 'Good shape', hint: 'Normal wear, no major damage' },
  { value: 'likeNew', label: 'Like-new', hint: 'Sharp corners, glossy, fresh-feeling' },
];

/** A single recent SOLD sale used as a comp (comparable sale) for pricing. */
export interface SoldComp {
  /** Final sold price in USD. */
  price: number;
  /** ISO date string the sale closed. */
  date: string;
  /** Human label for what sold, e.g. "VF (raw)" or "CGC 9.4". */
  label: string;
}

export interface ComicIssue {
  id: string;
  title: string;
  issueNumber: string;
  year: number;
  publisher: string;
  /** One-line context on why (or whether) this issue matters. */
  note: string;
  isKeyIssue: boolean;
  /** UPC/EAN barcode, when the issue's print run included one. Older books often lack one. */
  barcode?: string;
  /** Recent sold prices for raw (ungraded) copies. */
  rawSales: SoldComp[];
  /** Recent sold prices for professionally graded (CGC/CBCS) copies. */
  gradedSales: SoldComp[];
}

/** A computed, condition-adjusted price band — never a single number. */
export interface ValueBand {
  low: number;
  median: number;
  high: number;
  /** The comps that were actually used (outliers removed), pre-condition-adjustment. */
  usedComps: SoldComp[];
  /** The comps dropped as outliers (single highest + single lowest), for transparency. */
  excludedComps: SoldComp[];
}

/** A comic saved into the user's collection. */
export interface SavedComic {
  /** Unique id for this saved entry (not the same as the catalog issue id). */
  savedId: string;
  issueId: string;
  condition: Condition;
  savedAt: string;
}
