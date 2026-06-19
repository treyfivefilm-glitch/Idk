import type { ValueHistoryPoint } from '../lib/history';

const WIDTH = 240;

export function ValueHistorySparkline({ points, height = 56 }: { points: ValueHistoryPoint[]; height?: number }) {
  if (points.length < 2) return null;

  const mids = points.map((p) => (p.low + p.high) / 2);
  const min = Math.min(...mids);
  const max = Math.max(...mids);
  const span = max - min || 1;
  const trendingUp = mids[mids.length - 1] >= mids[0];

  const coords = mids.map((m, i) => {
    const x = (i / (mids.length - 1)) * WIDTH;
    const y = height - ((m - min) / span) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      height={height}
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
