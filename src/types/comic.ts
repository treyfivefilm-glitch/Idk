/** Plain-language condition tiers shown to users (kept simple — no grading jargon). */
export type Condition = 'worn' | 'good' | 'likeNew';

export const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: 'worn', label: 'Well-worn', hint: 'Creases, tears, heavy shelf wear' },
  { value: 'good', label: 'Good shape', hint: 'Normal wear, no major damage' },
  { value: 'likeNew', label: 'Like-new', hint: 'Sharp corners, glossy, fresh-feeling' },
];

export type GradingCompany = 'CGC' | 'CBCS';

/** A single recent professionally-graded SOLD sale (from GoCollect once live). */
export interface GradedSale {
  /** Final sold price in USD. */
  price: number;
  /** ISO date the sale closed. */
  date: string;
  /** Certified numeric grade, e.g. 9.4. */
  grade: number;
  gradingCompany: GradingCompany;
  saleType: 'auction' | 'fixed price';
}

/**
 * A single currently-ACTIVE raw listing — an asking price, not a sold price
 * (from eBay's Browse API once live, since sold raw data isn't available to
 * new developers). Must always be labeled as asking, never presented as sold.
 */
export interface RawListing {
  price: number;
  /** ISO date the listing was posted/observed. */
  date: string;
  /** Human label for the listing, e.g. "Listed · VF". */
  label: string;
}

export interface ComicIssue {
  id: string;
  title: string;
  issueNumber: string;
  year: number;
  publisher: string;
  /** Writer/artist credits, used for "group by creator" in the collection. */
  creators: string[];
  /** One-line context on why (or whether) this issue matters. */
  note: string;
  isKeyIssue: boolean;
  /** UPC/EAN barcode, when the issue's print run included one. Older books often lack one. */
  barcode?: string;
  /** Recent currently-listed raw asking prices. */
  rawListings: RawListing[];
  /** Recent professionally-graded (CGC/CBCS) sold prices. */
  gradedSales: GradedSale[];
}

/** A computed, condition-adjusted price band — never a single number. */
export interface ValueBand<T extends { price: number } = { price: number }> {
  low: number;
  median: number;
  high: number;
  /** The entries actually used (outliers removed), pre-condition-adjustment. */
  usedComps: T[];
  /** The entries dropped as outliers (single highest + single lowest), for transparency. */
  excludedComps: T[];
}

/** A named collection ("box") a comic can be filed into. */
export interface Collection {
  id: string;
  name: string;
  createdAt: string;
}

/** A comic saved into one of the user's collections, plus personal record-keeping fields. */
export interface SavedComic {
  /** Unique id for this saved entry (not the same as the catalog issue id). */
  savedId: string;
  issueId: string;
  collectionId: string;
  /** Used to adjust the raw asking-price band; irrelevant once `isSlabbed` is true. */
  condition: Condition;
  savedAt: string;
  /** Whether this specific physical copy is professionally graded and encapsulated. */
  isSlabbed: boolean;
  /** Certified or self-assessed numeric grade. */
  grade?: number;
  gradingCompany?: GradingCompany;
  purchasePrice?: number;
  purchaseDate?: string;
  /** Free-text physical location, e.g. "Box 3, closet shelf". */
  storageBox?: string;
  signedBy?: string;
  notes?: string;
  /** Data URL of a user-uploaded photo of their actual copy. */
  personalCoverUrl?: string;
}
