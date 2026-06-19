export function KeyIssueBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-key-soft px-2.5 py-1 text-xs font-semibold text-key">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M10 1.5l2.45 5.07 5.55.8-4 3.95.94 5.58L10 14.27l-4.94 2.63.94-5.58-4-3.95 5.55-.8L10 1.5z" />
      </svg>
      Key issue
    </span>
  );
}
