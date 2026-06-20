// Local stand-in for the real Comic Vine API, used only for sandbox verification —
// this sandbox's network egress is blocked from reaching comicvine.gamespot.com.
// Point COMICVINE_BASE_URL at this server's URL to exercise the real proxy/client
// code (api/_lib/comicvine.ts, api/comics/search.ts) end-to-end without any
// application-code changes. Not part of the shipped app.
import http from 'node:http';

const PORT = Number(process.argv[2] ?? 4319);

const ISSUES = [
  {
    id: 101,
    name: null,
    issue_number: '300',
    cover_date: '1988-05-01',
    volume: { id: 2222, name: 'The Amazing Spider-Man' },
    image: { thumb_url: 'https://mock.test/asm-300-thumb.jpg', small_url: 'https://mock.test/asm-300-small.jpg' },
  },
  {
    id: 102,
    name: null,
    issue_number: '1',
    cover_date: '1963-03-01',
    volume: { id: 2223, name: 'The Amazing Spider-Man' },
    image: { thumb_url: 'https://mock.test/asm-1-thumb.jpg' },
  },
  {
    id: 103,
    name: 'Great Power',
    issue_number: '1',
    cover_date: '2000-10-01',
    volume: { id: 2224, name: 'Ultimate Spider-Man' },
    image: { small_url: 'https://mock.test/usm-1-small.jpg' },
  },
  {
    id: 201,
    name: null,
    issue_number: '1',
    cover_date: '2012-03-14',
    volume: { id: 3001, name: 'Saga' },
    image: { thumb_url: 'https://mock.test/saga-1-thumb.jpg' },
  },
  {
    id: 301,
    name: null,
    issue_number: '1',
    cover_date: '1992-05-01',
    volume: { id: 4001, name: 'Spawn' },
    image: { thumb_url: 'https://mock.test/spawn-1-thumb.jpg' },
  },
  {
    id: 302,
    name: null,
    issue_number: '300',
    cover_date: '2019-08-01',
    volume: { id: 4001, name: 'Spawn' },
    image: { thumb_url: 'https://mock.test/spawn-300-thumb.jpg' },
  },
  // No volume at all — exercises the "Unknown title"/null-publisher fallback path.
  {
    id: 401,
    name: 'Untitled One-Shot',
    issue_number: null,
    cover_date: null,
    volume: null,
    image: null,
  },
  // Volume id with no entry in VOLUMES below — exercises "publisher lookup failed for this one issue only".
  {
    id: 402,
    name: null,
    issue_number: '7',
    cover_date: '2005-01-01',
    volume: { id: 9999, name: 'Orphan Volume' },
    image: { icon_url: 'https://mock.test/orphan-7-icon.jpg' },
  },
];

const VOLUMES = {
  2222: 'Marvel Comics',
  2223: 'Marvel Comics',
  2224: 'Marvel Comics',
  3001: 'Image Comics',
  4001: 'Image Comics',
};

let rateLimitHitCount = 0;

function envelope(results) {
  return { status_code: 1, error: 'OK', results };
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const userAgent = req.headers['user-agent'] ?? '';
  const apiKey = url.searchParams.get('api_key');
  const query = (url.searchParams.get('query') ?? '').toLowerCase();

  const redactedSearch = new URLSearchParams(url.searchParams);
  if (redactedSearch.has('api_key')) redactedSearch.set('api_key', 'REDACTED');
  console.log(`[mock-cv] ${req.method} ${url.pathname}?${redactedSearch}`);

  if (!userAgent) {
    send(res, 403, { status_code: 0, error: 'No user agent provided', results: [] });
    return;
  }
  if (!apiKey) {
    send(res, 200, { status_code: 100, error: 'No API key provided', results: [] });
    return;
  }

  if (query.includes('fail-test')) {
    send(res, 500, { status_code: 0, error: 'Internal error', results: [] });
    return;
  }

  if (query.includes('ratelimit-test')) {
    // Odd-numbered hits rate-limit, even-numbered hits succeed — so each logical
    // search (which retries) sees exactly one 420 before the retry succeeds.
    rateLimitHitCount++;
    if (rateLimitHitCount % 2 === 1) {
      send(res, 420, { status_code: 0, error: 'Enhance Your Calm', results: [] });
      return;
    }
    send(res, 200, envelope([ISSUES[0]]));
    return;
  }

  if (url.pathname === '/search/') {
    const matches = ISSUES.filter((issue) => {
      const haystack = `${issue.volume?.name ?? ''} ${issue.name ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
    send(res, 200, envelope(matches));
    return;
  }

  if (url.pathname === '/volumes/') {
    const filter = url.searchParams.get('filter') ?? '';
    const ids = filter.startsWith('id:') ? filter.slice(3).split('|').map(Number) : [];
    const results = ids
      .filter((id) => id in VOLUMES)
      .map((id) => ({ id, publisher: { name: VOLUMES[id] } }));
    send(res, 200, envelope(results));
    return;
  }

  send(res, 404, { status_code: 0, error: 'Not found', results: [] });
});

server.listen(PORT, () => {
  console.log(`[mock-cv] Mock Comic Vine server listening on http://localhost:${PORT}`);
});
