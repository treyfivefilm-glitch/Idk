import type { IncomingMessage, ServerResponse } from 'http';
import { searchComicVine } from '../_lib/comicvine';

/**
 * GET /api/comics/search?q=...
 *
 * Plain Node request handler (not `@vercel/node`'s VercelRequest/Response) so
 * the exact same function runs as a Vercel serverless function in
 * production and as Vite dev-server middleware locally (see vite.config.ts)
 * — no duplicated proxy logic between the two.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://internal');
  const query = (url.searchParams.get('q') ?? '').trim();

  res.setHeader('Content-Type', 'application/json');

  if (!query) {
    res.statusCode = 200;
    res.end(JSON.stringify({ results: [] }));
    return;
  }

  const outcome = await searchComicVine(query);

  if (!outcome.ok) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'unavailable' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ results: outcome.results }));
}
