import { useEffect, useRef, useState } from 'react';
import { searchComics, type SearchedComic } from './comicSearch';

const DEBOUNCE_MS = 400;

export type ComicSearchStatus = 'idle' | 'loading' | 'ok' | 'empty' | 'error';

interface SettledResult {
  query: string;
  status: 'ok' | 'empty' | 'error';
  results: SearchedComic[];
}

/** Debounced, cancellation-safe wrapper around `searchComics` for live-as-you-type search inputs. */
export function useComicSearch(query: string): { status: ComicSearchStatus; results: SearchedComic[] } {
  const trimmed = query.trim();
  const [settled, setSettled] = useState<SettledResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    if (!trimmed) return;

    const timer = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      searchComics(trimmed, controller.signal)
        .then((outcome) => {
          if (controller.signal.aborted) return;
          if (outcome.status === 'ok') setSettled({ query: trimmed, status: 'ok', results: outcome.results });
          else setSettled({ query: trimmed, status: outcome.status, results: [] });
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setSettled({ query: trimmed, status: 'error', results: [] });
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed]);

  if (!trimmed) return { status: 'idle', results: [] };
  // Stale settled result from a previous query (or none yet) — the debounced/in-flight request hasn't settled for this query.
  if (!settled || settled.query !== trimmed) return { status: 'loading', results: [] };
  return { status: settled.status, results: settled.results };
}
