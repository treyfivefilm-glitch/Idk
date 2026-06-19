interface TickerCodeProps {
  code: string;
  className?: string;
}

/** Brokerage-style ticker code, e.g. "ASM-300" — always mono + brand cyan. */
export function TickerCode({ code, className = '' }: TickerCodeProps) {
  return <span className={`font-mono text-brand ${className}`}>{code}</span>;
}
