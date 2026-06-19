import { useId } from 'react';

interface AreaChartProps {
  values: number[];
  positive?: boolean;
  height?: number;
  className?: string;
}

const WIDTH = 240;

/** Generic gradient-filled line chart — same coordinate math as `ValueHistorySparkline`, plus a fill. */
export function AreaChart({ values, positive = true, height = 72, className = '' }: AreaChartProps) {
  const rawId = useId();
  const gradientId = `area-gradient-${rawId.replace(/:/g, '')}`;

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * WIDTH;
    const y = height - ((v - min) / span) * (height - 8) - 4;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${WIDTH},${height} L0,${height} Z`;
  const color = positive ? 'var(--color-gain)' : 'var(--color-loss)';

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      height={height}
      aria-hidden="true"
      className={`block ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
