import { getIssueById } from '../data/catalog';
import type { GradedSale, RawListing } from '../types/comic';

export interface ValueResult {
  /** Currently-listed asking prices — NOT sold data. */
  rawListings: RawListing[];
  /** Professionally-graded sold sales. */
  gradedSales: GradedSale[];
}

/**
 * ============================================================================
 * STUBBED — PRICE DATA
 * ============================================================================
 * Returns mock raw-asking and graded-sold arrays from our seed catalog. Two
 * different real data sources feed this once live, and they must stay
 * separate — never blended into one number, and never relabeled as the
 * other:
 *
 *   1. GRADED SOLD SALES → GoCollect API (https://gocollect.com/api-docs).
 *      Self-serve API key, free basic tier, ~$89/yr for the Pro tier.
 *      Returns individual graded sales (price, date, certified grade,
 *      grading company, sale type) plus 30/90/365-day rolling averages for a
 *      given issue. Map each sale straight into `GradedSale`.
 *
 *   2. RAW ASKING PRICES → eBay's Browse API (developer.ebay.com), which is
 *      free and covers ACTIVE listings only. eBay's sold-listings API
 *      (Marketplace Insights) is a Limited Release product not available to
 *      new developers, which is exactly why this app never claims to show
 *      sold raw prices — only what raw copies are currently asking. Map each
 *      active listing into `RawListing`, and keep the UI label honest (e.g.
 *      "Listed · VF", never "Sold").
 *
 * Either way:
 *   - Keep returning ARRAYS of individual entries — never collapse to one
 *     number here. All trimming/averaging happens in `lib/valuation.ts`,
 *     where it stays visible to the user via "How we calculated this".
 *   - Never let a raw listing's asking price be presented as a sold price,
 *     and never blend raw and graded into a single band.
 *
 * Required env vars once live: GOCOLLECT_API_KEY, EBAY_APP_ID, EBAY_CERT_ID
 * (see README for details).
 * ============================================================================
 */
export async function fetchValue(issueId: string): Promise<ValueResult> {
  await new Promise((resolve) => setTimeout(resolve, 450)); // simulate network latency

  const issue = getIssueById(issueId);
  if (!issue) {
    return { rawListings: [], gradedSales: [] };
  }
  return { rawListings: issue.rawListings, gradedSales: issue.gradedSales };
}
