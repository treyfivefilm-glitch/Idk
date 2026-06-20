import type { ComicIssue } from '../types/comic';

/** Simplified shape returned by our `/api/comics/search` proxy (see `api/_lib/comicvine.ts`). */
export interface SearchedComic {
  id: string;
  title: string;
  issueNumber: string;
  year: number | null;
  publisher: string | null;
  coverImageUrl: string | null;
}

export type ComicSearchResult =
  | { status: 'ok'; results: SearchedComic[] }
  | { status: 'empty' }
  | { status: 'error' };

/** Calls the backend Comic Vine proxy — never the real API directly (see api/comics/search.ts). */
export async function searchComics(query: string, signal?: AbortSignal): Promise<ComicSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { status: 'empty' };

  try {
    const res = await fetch(`/api/comics/search?q=${encodeURIComponent(trimmed)}`, { signal });
    if (!res.ok) {
      console.error(`Comic search request failed with status ${res.status}`);
      return { status: 'error' };
    }
    const body = (await res.json()) as { results: SearchedComic[] };
    return body.results.length > 0 ? { status: 'ok', results: body.results } : { status: 'empty' };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    console.error('Comic search request failed:', err);
    return { status: 'error' };
  }
}

/** Maps a search result into a full `ComicIssue` so it can be registered/displayed like a catalog issue. */
export function toComicIssue(comic: SearchedComic): ComicIssue {
  return {
    id: comic.id,
    title: comic.title,
    issueNumber: comic.issueNumber,
    year: comic.year ?? 0,
    publisher: comic.publisher ?? 'Unknown publisher',
    creators: [],
    note: '',
    isKeyIssue: false,
    coverImageUrl: comic.coverImageUrl ?? undefined,
    rawListings: [],
    gradedSales: [],
  };
}
