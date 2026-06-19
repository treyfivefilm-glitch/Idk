/**
 * Deterministic mock "value over time" for the collection summary sparkline.
 * Seeded off a stable key — never `Math.random()` — so the same collection
 * renders the same trend every time instead of jittering on each re-render.
 * The live version would replace this entirely by reading periodic
 * server-side snapshots of the real computed total, not inventing a trend.
 */
export interface ValueHistoryPoint {
  /** ISO date for this point. */
  date: string;
  low: number;
  high: number;
}

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/** Builds `points` monthly samples that drift gently up to today's real low/high, with small seeded variance. */
export function buildValueHistory(
  seedKey: string,
  currentLow: number,
  currentHigh: number,
  points = 6,
): ValueHistoryPoint[] {
  const rand = seededRandom(seedKey);
  const monthsBack = points - 1;
  const history: ValueHistoryPoint[] = [];

  for (let i = 0; i < points; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (monthsBack - i));

    const progress = monthsBack === 0 ? 1 : i / monthsBack;
    const drift = 0.78 + progress * 0.22; // earlier points trend lower than today
    const noise = 0.94 + rand() * 0.08;
    const factor = i === monthsBack ? 1 : drift * noise;

    history.push({
      date: date.toISOString().slice(0, 10),
      low: Math.round(currentLow * factor),
      high: Math.round(currentHigh * factor),
    });
  }

  return history;
}
