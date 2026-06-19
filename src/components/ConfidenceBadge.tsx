import { LOW_CONFIDENCE_THRESHOLD } from '../services/recognition';

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const low = confidence < LOW_CONFIDENCE_THRESHOLD;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        low ? 'bg-danger-soft text-danger' : 'bg-value-soft text-value'
      }`}
    >
      {pct}% confident
    </span>
  );
}
