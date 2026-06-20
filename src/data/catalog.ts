import type { ComicIssue } from '../types/comic';

/**
 * No curated seed comics — every issue in the app is sourced via live Comic
 * Vine search (see `src/lib/comicSearch.ts`), which carries a real
 * `coverImageUrl` but no seeded pricing/comp data yet.
 */
export const CATALOG: ComicIssue[] = [];

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
