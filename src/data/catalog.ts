import type { ComicIssue, SoldComp } from '../types/comic';

/** Returns an ISO date string `n` days before now, so the seed data always reads as "recent". */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function comps(entries: [price: number, label: string, daysBack: number][]): SoldComp[] {
  return entries.map(([price, label, daysBack]) => ({ price, label, date: daysAgo(daysBack) }));
}

export const CATALOG: ComicIssue[] = [
  {
    id: 'asm-300',
    title: 'The Amazing Spider-Man',
    issueNumber: '#300',
    year: 1988,
    publisher: 'Marvel Comics',
    note: 'First full appearance of Venom, classic McFarlane cover.',
    isKeyIssue: true,
    barcode: '071486028703',
    rawSales: comps([
      [150, 'GD (raw)', 58],
      [180, 'VG (raw)', 51],
      [220, 'FN (raw)', 44],
      [245, 'FN/VF (raw)', 37],
      [275, 'VF (raw)', 29],
      [310, 'VF (raw)', 21],
      [395, 'VF/NM (raw)', 12],
      [460, 'NM- (raw)', 4],
    ]),
    gradedSales: comps([
      [540, 'CGC 8.0', 49],
      [650, 'CGC 8.5', 40],
      [720, 'CBCS 9.0', 33],
      [980, 'CGC 9.2', 25],
      [1450, 'CGC 9.4', 18],
      [2200, 'CGC 9.6', 9],
      [3100, 'CGC 9.8', 2],
    ]),
  },
  {
    id: 'hulk-181',
    title: 'The Incredible Hulk',
    issueNumber: '#181',
    year: 1974,
    publisher: 'Marvel Comics',
    note: 'First full appearance of Wolverine — one of the most sought-after Bronze Age keys.',
    isKeyIssue: true,
    // Pre-dates UPC barcodes on comics, so it's a good example of a book the scanner can't find by barcode.
    rawSales: comps([
      [750, 'GD/VG (raw)', 55],
      [900, 'VG (raw)', 47],
      [1100, 'VG/FN (raw)', 39],
      [1300, 'FN (raw)', 31],
      [1450, 'FN/VF (raw)', 23],
      [1600, 'VF (raw)', 15],
      [2200, 'VF/NM (raw)', 7],
      [2750, 'NM- (raw)', 1],
    ]),
    gradedSales: comps([
      [3200, 'CGC 6.5', 52],
      [4100, 'CGC 7.5', 42],
      [5200, 'CBCS 8.0', 33],
      [6800, 'CGC 8.5', 24],
      [8200, 'CGC 9.0', 16],
      [12000, 'CGC 9.4', 8],
      [15500, 'CGC 9.6', 3],
    ]),
  },
  {
    id: 'nm-98',
    title: 'The New Mutants',
    issueNumber: '#98',
    year: 1991,
    publisher: 'Marvel Comics',
    note: 'First appearance of Deadpool.',
    isKeyIssue: true,
    barcode: '071486028995',
    rawSales: comps([
      [45, 'GD (raw)', 50],
      [60, 'VG (raw)', 43],
      [75, 'FN (raw)', 36],
      [90, 'FN/VF (raw)', 29],
      [110, 'VF (raw)', 22],
      [130, 'VF (raw)', 14],
      [150, 'VF/NM (raw)', 7],
      [200, 'NM- (raw)', 2],
    ]),
    gradedSales: comps([
      [280, 'CGC 8.5', 46],
      [340, 'CBCS 9.0', 38],
      [420, 'CGC 9.2', 29],
      [510, 'CGC 9.4', 20],
      [650, 'CGC 9.6', 11],
      [800, 'CGC 9.8', 4],
    ]),
  },
  {
    id: 'saga-1',
    title: 'Saga',
    issueNumber: '#1',
    year: 2012,
    publisher: 'Image Comics',
    note: 'First issue of the acclaimed Vaughan/Staples series — a modern key with strong ongoing demand.',
    isKeyIssue: true,
    barcode: '709853024112',
    rawSales: comps([
      [12, 'GD/VG (raw)', 40],
      [18, 'FN (raw)', 33],
      [22, 'FN/VF (raw)', 27],
      [25, 'VF (raw)', 20],
      [28, 'VF (raw)', 13],
      [32, 'VF/NM (raw)', 7],
      [38, 'NM (raw)', 3],
      [55, 'NM (raw)', 1],
    ]),
    gradedSales: comps([
      [65, 'CGC 9.4', 35],
      [80, 'CGC 9.6', 26],
      [95, 'CBCS 9.6', 18],
      [120, 'CGC 9.8', 10],
      [150, 'CGC 9.8', 4],
    ]),
  },
  {
    id: 'spawn-1',
    title: 'Spawn',
    issueNumber: '#1',
    year: 1992,
    publisher: 'Image Comics',
    note: 'First appearance of Spawn — a McFarlane launch title, plentiful but still in demand.',
    isKeyIssue: true,
    barcode: '709853000018',
    rawSales: comps([
      [15, 'GD (raw)', 47],
      [25, 'VG (raw)', 39],
      [30, 'FN (raw)', 32],
      [35, 'FN/VF (raw)', 25],
      [40, 'VF (raw)', 18],
      [45, 'VF (raw)', 11],
      [55, 'VF/NM (raw)', 5],
      [70, 'NM (raw)', 1],
    ]),
    gradedSales: comps([
      [90, 'CGC 9.2', 36],
      [110, 'CGC 9.4', 27],
      [130, 'CGC 9.6', 19],
      [160, 'CGC 9.8', 10],
      [200, 'CGC 9.8', 3],
    ]),
  },
  {
    id: 'xmen-1-1991',
    title: 'X-Men',
    issueNumber: '#1',
    year: 1991,
    publisher: 'Marvel Comics',
    note: 'Huge 1991 launch with one of the largest print runs in comics history (~8 million copies) — historically notable, but oversupply keeps resale value low even in top condition.',
    isKeyIssue: false,
    barcode: '071486029008',
    rawSales: comps([
      [2, 'GD (raw)', 44],
      [3, 'VG (raw)', 37],
      [4, 'FN (raw)', 30],
      [5, 'FN/VF (raw)', 23],
      [5, 'VF (raw)', 16],
      [6, 'VF (raw)', 9],
      [8, 'VF/NM (raw)', 4],
      [12, 'NM (raw)', 1],
    ]),
    // Deliberately sparse — most owners don't bother grading a common book, which is itself useful info.
    gradedSales: comps([
      [15, 'CGC 9.8', 30],
      [20, 'CGC 9.8', 10],
    ]),
  },
];

export function getIssueById(id: string): ComicIssue | undefined {
  return CATALOG.find((issue) => issue.id === id);
}

export function getIssueByBarcode(barcode: string): ComicIssue | undefined {
  return CATALOG.find((issue) => issue.barcode === barcode);
}

export function searchCatalog(query: string): ComicIssue[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter((issue) => {
    const haystack = `${issue.title} ${issue.issueNumber} ${issue.publisher} ${issue.year}`.toLowerCase();
    return haystack.includes(q);
  });
}
