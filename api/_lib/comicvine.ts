/**
 * Server-only Comic Vine client. Never import this from client code — it
 * reads a secret API key from process.env and must stay behind the proxy
 * endpoint in `api/comics/search.ts`.
 *
 * Two real upstream calls happen per search:
 *   1. `/search/` (resources=issue) — title, issue number, cover date, image.
 *   2. `/volumes/` — Comic Vine's issue-search results do NOT include a
 *      publisher field directly (it lives on the issue's parent volume), so
 *      publisher names are resolved with one batched follow-up call keyed by
 *      the unique volume ids from step 1, rather than guessing or omitting it.
 */

const REAL_BASE_URL = 'https://comicvine.gamespot.com/api';
const USER_AGENT = 'PanelWorth/1.0 (contact: treyfivefilm@gmail.com)';
/** Backoff delays for retryable failures (rate-limited / transient upstream errors). */
const RETRY_DELAYS_MS = [500, 1500];

export interface SimplifiedComic {
  id: string;
  title: string;
  issueNumber: string;
  year: number | null;
  publisher: string | null;
  coverImageUrl: string | null;
}

export type ComicVineSearchOutcome =
  | { ok: true; results: SimplifiedComic[] }
  | { ok: false; reason: 'config' | 'rate-limited' | 'upstream' | 'network' };

interface ComicVineImage {
  thumb_url?: string;
  small_url?: string;
  icon_url?: string;
}

interface ComicVineIssueResult {
  id: number;
  name?: string | null;
  issue_number?: string | null;
  cover_date?: string | null;
  volume?: { id: number; name?: string } | null;
  image?: ComicVineImage | null;
}

interface ComicVineVolumeResult {
  id: number;
  publisher?: { name?: string } | null;
}

interface ComicVineEnvelope<T> {
  status_code: number;
  error: string;
  results: T[];
}

function baseUrl(): string {
  return process.env.COMICVINE_BASE_URL?.trim() || REAL_BASE_URL;
}

type FetchOutcome<T> = { ok: true; body: T } | { ok: false; reason: 'rate-limited' | 'upstream' | 'network' };

async function fetchComicVine<T>(path: string, params: Record<string, string>): Promise<FetchOutcome<ComicVineEnvelope<T>>> {
  const url = new URL(`${baseUrl()}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  let lastReason: 'rate-limited' | 'upstream' | 'network' = 'network';

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(url.toString(), { headers: { 'User-Agent': USER_AGENT } });

      if (res.status === 420 || res.status === 429) {
        lastReason = 'rate-limited';
      } else if (!res.ok) {
        console.error(`Comic Vine ${path} responded ${res.status}`);
        lastReason = 'upstream';
      } else {
        const body = (await res.json()) as ComicVineEnvelope<T>;
        if (body.status_code !== 1) {
          console.error(`Comic Vine ${path} returned status_code ${body.status_code}: ${body.error}`);
          return { ok: false, reason: 'upstream' };
        }
        return { ok: true, body };
      }
    } catch (err) {
      console.error(`Comic Vine ${path} request failed:`, err);
      lastReason = 'network';
    }

    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  return { ok: false, reason: lastReason };
}

function parseYear(coverDate: string | null | undefined): number | null {
  if (!coverDate) return null;
  const year = Number(coverDate.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : null;
}

export async function searchComicVine(query: string): Promise<ComicVineSearchOutcome> {
  const apiKey = process.env.COMICVINE_API_KEY;
  if (!apiKey) {
    console.error('COMICVINE_API_KEY is not configured on the server.');
    return { ok: false, reason: 'config' };
  }

  const searchOutcome = await fetchComicVine<ComicVineIssueResult>('/search/', {
    api_key: apiKey,
    format: 'json',
    resources: 'issue',
    query,
    field_list: 'id,name,issue_number,volume,cover_date,image',
    limit: '12',
  });
  if (!searchOutcome.ok) return { ok: false, reason: searchOutcome.reason };

  const issues = searchOutcome.body.results;
  const volumeIds = [...new Set(issues.map((issue) => issue.volume?.id).filter((id): id is number => typeof id === 'number'))];

  const publisherByVolume = new Map<number, string>();
  if (volumeIds.length > 0) {
    const volumesOutcome = await fetchComicVine<ComicVineVolumeResult>('/volumes/', {
      api_key: apiKey,
      format: 'json',
      filter: `id:${volumeIds.join('|')}`,
      field_list: 'id,publisher',
    });
    // A failed publisher lookup isn't fatal to the search itself — those issues just show a null publisher.
    if (volumesOutcome.ok) {
      for (const volume of volumesOutcome.body.results) {
        if (volume.publisher?.name) publisherByVolume.set(volume.id, volume.publisher.name);
      }
    }
  }

  const results: SimplifiedComic[] = issues.map((issue) => ({
    id: `cv-${issue.id}`,
    title: issue.volume?.name?.trim() || issue.name?.trim() || 'Unknown title',
    issueNumber: issue.issue_number ? `#${issue.issue_number}` : '#?',
    year: parseYear(issue.cover_date),
    publisher: (issue.volume?.id != null ? publisherByVolume.get(issue.volume.id) : undefined) ?? null,
    coverImageUrl: issue.image?.thumb_url || issue.image?.small_url || issue.image?.icon_url || null,
  }));

  return { ok: true, results };
}
