/**
 * Builds a link to eBay's own sold/completed-listings search UI — a normal
 * outbound hyperlink, not an API call. The live pricing data in
 * `services/comps.ts` should come from eBay's Marketplace Insights API
 * instead; this link just lets a curious user browse the underlying sales.
 */
export function ebaySoldListingsUrl(title: string, issueNumber: string): string {
  const params = new URLSearchParams({
    _nkw: `${title} ${issueNumber} comic`,
    LH_Sold: '1',
    LH_Complete: '1',
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}
