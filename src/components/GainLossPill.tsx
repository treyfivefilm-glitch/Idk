interface GainLossPillProps {
  percent: number;
  size?: 'sm' | 'md';
}

/** Colored mono percentage pill — green for gains, red for losses, never any other use of those colors. */
export function GainLossPill({ percent, size = 'md' }: GainLossPillProps) {
  const positive = percent >= 0;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-mono font-semibold ${sizeClasses} ${
        positive ? 'bg-gain-soft text-gain' : 'bg-loss-soft text-loss'
      }`}
    >
      {positive ? '▲' : '▼'} {Math.abs(percent).toFixed(1)}%
    </span>
  );
}
