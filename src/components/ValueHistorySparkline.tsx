import type { ValueHistoryPoint } from '../lib/history';

const WIDTH = 240;
const HEIGHT = 56;

export function ValueHistorySparkline({ points }: { points: ValueHistoryPoint[] }) {
  if (points.length < 2) return null;

  const mids = points.map((p) => (p.low + p.high) / 2);
  const min = Math.min(...mids);
  const max = Math.max(...mids);
  const span = max - min || 1;
  const trendingUp = mids[mids.length - 1] >= mids[0];

  const coords = mids.map((m, i) => {
    const x = (i / (mids.length - 1)) * WIDTH;
    const y = HEIGHT - ((m - min) / span) * (HEIGHT - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      aria-hidden="true"
      className="block"
    >
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={trendingUp ? 'var(--color-value)' : 'var(--color-danger)'}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
