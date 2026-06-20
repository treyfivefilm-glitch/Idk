import type { ComicIssue, GradedSale, RawListing } from '../types/comic';

/** Returns an ISO date string `n` days before now, so the seed data always reads as "recent". */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Raw, currently-ACTIVE asking listings — never sold data. Label mirrors a real eBay listing title. */
function listings(entries: [price: number, label: string, daysBack: number][]): RawListing[] {
  return entries.map(([price, label, daysBack]) => ({ price, label: `Listed · ${label}`, date: daysAgo(daysBack) }));
}

/** Professionally-graded SOLD sales. */
function sales(
  entries: [
    price: number,
    grade: number,
    gradingCompany: GradedSale['gradingCompany'],
    saleType: GradedSale['saleType'],
    daysBack: number,
  ][],
): GradedSale[] {
  return entries.map(([price, grade, gradingCompany, saleType, daysBack]) => ({
    price,
    grade,
    gradingCompany,
    saleType,
    date: daysAgo(daysBack),
  }));
}

export const CATALOG: ComicIssue[] = [
  {
    id: 'asm-300',
    title: 'The Amazing Spider-Man',
    issueNumber: '#300',
    year: 1988,
    publisher: 'Marvel Comics',
    creators: ['David Michelinie', 'Todd McFarlane'],
    note: 'First full appearance of Venom, classic McFarlane cover.',
    isKeyIssue: true,
    barcode: '071486028703',
    rawListings: listings([
      [165, 'GD', 3],
      [195, 'VG', 7],
      [230, 'FN', 11],
      [260, 'FN/VF', 5],
      [295, 'VF', 9],
      [330, 'VF', 14],
      [410, 'VF/NM', 2],
      [480, 'NM-', 20],
    ]),
    gradedSales: sales([
      [540, 8.0, 'CGC', 'auction', 49],
      [650, 8.5, 'CGC', 'fixed price', 40],
      [720, 9.0, 'CBCS', 'auction', 33],
      [980, 9.2, 'CGC', 'fixed price', 25],
      [1450, 9.4, 'CGC', 'auction', 18],
      [2200, 9.6, 'CGC', 'fixed price', 9],
      [3100, 9.8, 'CGC', 'auction', 2],
    ]),
  },
  {
    id: 'hulk-181',
    title: 'The Incredible Hulk',
    issueNumber: '#181',
    year: 1974,
    publisher: 'Marvel Comics',
    creators: ['Len Wein', 'Herb Trimpe'],
    note: 'First full appearance of Wolverine — one of the most sought-after Bronze Age keys.',
    isKeyIssue: true,
    // Pre-dates UPC barcodes on comics, so it's a good example of a book the scanner can't find by barcode.
    rawListings: listings([
      [780, 'GD/VG', 6],
      [930, 'VG', 13],
      [1140, 'VG/FN', 4],
      [1340, 'FN', 18],
      [1500, 'FN/VF', 9],
      [1650, 'VF', 2],
      [2300, 'VF/NM', 22],
      [2850, 'NM-', 11],
    ]),
    gradedSales: sales([
      [3200, 6.5, 'CGC', 'auction', 52],
      [4100, 7.5, 'CGC', 'fixed price', 42],
      [5200, 8.0, 'CBCS', 'auction', 33],
      [6800, 8.5, 'CGC', 'fixed price', 24],
      [8200, 9.0, 'CGC', 'auction', 16],
      [12000, 9.4, 'CGC', 'fixed price', 8],
      [15500, 9.6, 'CGC', 'auction', 3],
    ]),
  },
  {
    id: 'nm-98',
    title: 'The New Mutants',
    issueNumber: '#98',
    year: 1991,
    publisher: 'Marvel Comics',
    creators: ['Rob Liefeld', 'Fabian Nicieza'],
    note: 'First appearance of Deadpool.',
    isKeyIssue: true,
    barcode: '071486028995',
    rawListings: listings([
      [48, 'GD', 5],
      [63, 'VG', 9],
      [78, 'FN', 16],
      [95, 'FN/VF', 3],
      [115, 'VF', 21],
      [135, 'VF', 8],
      [155, 'VF/NM', 12],
      [210, 'NM-', 1],
    ]),
    gradedSales: sales([
      [280, 8.5, 'CGC', 'fixed price', 46],
      [340, 9.0, 'CBCS', 'auction', 38],
      [420, 9.2, 'CGC', 'fixed price', 29],
      [510, 9.4, 'CGC', 'auction', 20],
      [650, 9.6, 'CGC', 'fixed price', 11],
      [800, 9.8, 'CGC', 'auction', 4],
    ]),
  },
  {
    id: 'saga-1',
    title: 'Saga',
    issueNumber: '#1',
    year: 2012,
    publisher: 'Image Comics',
    creators: ['Brian K. Vaughan', 'Fiona Staples'],
    note: 'First issue of the acclaimed Vaughan/Staples series — a modern key with strong ongoing demand.',
    isKeyIssue: true,
    barcode: '709853024112',
    rawListings: listings([
      [13, 'GD/VG', 4],
      [19, 'FN', 10],
      [23, 'FN/VF', 17],
      [26, 'VF', 2],
      [29, 'VF', 7],
      [34, 'VF/NM', 13],
      [40, 'NM', 23],
      [58, 'NM', 1],
    ]),
    gradedSales: sales([
      [65, 9.4, 'CGC', 'fixed price', 35],
      [80, 9.6, 'CGC', 'auction', 26],
      [95, 9.6, 'CBCS', 'fixed price', 18],
      [120, 9.8, 'CGC', 'auction', 10],
      [150, 9.8, 'CGC', 'fixed price', 4],
    ]),
  },
  {
    id: 'spawn-1',
    title: 'Spawn',
    issueNumber: '#1',
    year: 1992,
    publisher: 'Image Comics',
    creators: ['Todd McFarlane'],
    note: 'First appearance of Spawn — a McFarlane launch title, plentiful but still in demand.',
    isKeyIssue: true,
    barcode: '709853000018',
    rawListings: listings([
      [16, 'GD', 6],
      [27, 'VG', 11],
      [32, 'FN', 19],
      [37, 'FN/VF', 3],
      [42, 'VF', 8],
      [48, 'VF', 15],
      [58, 'VF/NM', 24],
      [72, 'NM', 1],
    ]),
    gradedSales: sales([
      [90, 9.2, 'CGC', 'auction', 36],
      [110, 9.4, 'CGC', 'fixed price', 27],
      [130, 9.6, 'CBCS', 'auction', 19],
      [160, 9.8, 'CGC', 'fixed price', 10],
      [200, 9.8, 'CGC', 'auction', 3],
    ]),
  },
  {
    id: 'xmen-1-1991',
    title: 'X-Men',
    issueNumber: '#1',
    year: 1991,
    publisher: 'Marvel Comics',
    creators: ['Chris Claremont', 'Jim Lee'],
    note: 'Huge 1991 launch with one of the largest print runs in comics history (~8 million copies) — historically notable, but oversupply keeps resale value low even in top condition.',
    isKeyIssue: false,
    barcode: '071486029008',
    rawListings: listings([
      [2, 'GD', 7],
      [3, 'VG', 14],
      [4, 'FN', 21],
      [5, 'FN/VF', 2],
      [5, 'VF', 9],
      [6, 'VF', 16],
      [8, 'VF/NM', 25],
      [12, 'NM', 1],
    ]),
    // Deliberately sparse — most owners don't bother grading a common book, which is itself useful info.
    gradedSales: sales([
      [15, 9.8, 'CGC', 'auction', 30],
      [20, 9.8, 'CGC', 'fixed price', 10],
    ]),
  },
];

const DISCOVERED_STORAGE_KEY = 'panelworth.discovered-issues';

/**
 * Issues identified via live Comic Vine search (see `src/lib/comicSearch.ts`)
 * aren't part of the curated seed catalog and have no seeded pricing data —
 * but they still need to resolve by id on the results/detail/collection
 * pages, including after a reload. Kept separate from `CATALOG` itself so
 * the seed data file stays static and the two never get conflated.
 */
const discovered = new Map<string, ComicIssue>();

function loadDiscovered() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(DISCOVERED_STORAGE_KEY);
    if (!raw) return;
    const entries: ComicIssue[] = JSON.parse(raw);
    for (const issue of entries) discovered.set(issue.id, issue);
  } catch {
    // Corrupt/unavailable storage — fall back to an empty registry rather than crashing.
  }
}

function persistDiscovered() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DISCOVERED_STORAGE_KEY, JSON.stringify([...discovered.values()]));
}

loadDiscovered();

/** Registers (or updates) a comic identified via search so later lookups by id can resolve it. */
export function registerDiscoveredIssue(issue: ComicIssue): void {
  discovered.set(issue.id, issue);
  persistDiscovered();
}

export function getIssueById(id: string): ComicIssue | undefined {
  return CATALOG.find((issue) => issue.id === id) ?? discovered.get(id);
}

export function getIssueByBarcode(barcode: string): ComicIssue | undefined {
  return CATALOG.find((issue) => issue.barcode === barcode);
}
