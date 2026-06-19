import { getIssueById } from '../data/catalog';
import type { SoldComp } from '../types/comic';

export interface CompsResult {
  raw: SoldComp[];
  graded: SoldComp[];
}

/**
 * ============================================================================
 * STUBBED — PRICE DATA
 * ============================================================================
 * This returns mock arrays of recent SOLD prices from our seed catalog.
 *
 * To make this live:
 *   1. Register a developer.ebay.com account and create an app to get an
 *      App ID / OAuth credentials.
 *   2. Call eBay's Marketplace Insights API (sold/completed items) — NOT the
 *      Browse API, which only returns active listings — filtered to the
 *      comic's title/issue and category (Collectibles > Comics).
 *   3. You MUST comply with eBay's API License Agreement: cache responses
 *      per their TTL rules, attribute eBay as the data source in the UI,
 *      and never present asking prices as sold prices.
 *   4. Map each result to a `SoldComp` ({ price, date, label }), splitting
 *      raw vs graded by detecting "CGC"/"CBCS" + a grade number in the
 *      listing title (a simple regex is enough to start).
 *   5. Keep returning ARRAYS of individual sales — never collapse to one
 *      number here. All trimming/averaging happens in `lib/valuation.ts`,
 *      where it stays visible to the user via "How we calculated this".
 *
 * Required env vars once live: EBAY_APP_ID, EBAY_CERT_ID, EBAY_OAUTH_TOKEN
 * (see README for details).
 * ============================================================================
 */
export async function fetchComps(issueId: string): Promise<CompsResult> {
  await new Promise((resolve) => setTimeout(resolve, 450)); // simulate network latency

  const issue = getIssueById(issueId);
  if (!issue) {
    return { raw: [], graded: [] };
  }
  return { raw: issue.rawSales, graded: issue.gradedSales };
}
