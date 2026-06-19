/**
 * Builds links to eBay's own search UI — normal outbound hyperlinks, not API
 * calls. The live pricing data in `services/value.ts` comes from real APIs
 * instead (GoCollect for graded sold sales, eBay's Browse API for raw
 * currently-listed asking prices); these links just let a curious user
 * browse the underlying listings themselves.
 */
export function ebaySoldListingsUrl(title: string, issueNumber: string): string {
  const params = new URLSearchParams({
    _nkw: `${title} ${issueNumber} comic`,
    LH_Sold: '1',
    LH_Complete: '1',
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}

/** Active, currently-listed (NOT sold) listings — matches what the raw asking-price band is built from. */
export function ebayActiveListingsUrl(title: string, issueNumber: string): string {
  const params = new URLSearchParams({
    _nkw: `${title} ${issueNumber} comic`,
  });
  return `https://www.ebay.com/sch/i.html?${params.toString()}`;
}
