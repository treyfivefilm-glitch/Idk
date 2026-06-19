import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, showBack, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
      {showBack ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
      <h1 className="flex-1 truncate text-lg font-semibold text-ink">{title}</h1>
      {right}
    </header>
  );
}
