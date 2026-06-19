export function OwnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-value-soft px-2.5 py-1 text-xs font-semibold text-value">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      In your collection
    </span>
  );
}
