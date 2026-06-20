import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/collection', label: 'Collection', icon: CollectionIcon },
  { to: '/account', label: 'Account', icon: AccountIcon },
];

export function BottomNav() {
  return (
    <nav className="grid grid-cols-3 border-t border-slate-100 bg-paper pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
              isActive ? 'text-brand' : 'text-ink-soft hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 11.5L12 4l8 7.5M6 9.5V19a1 1 0 001 1h3v-5a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1V9.5"
        stroke="currentColor"
        strokeWidth={active ? 2.25 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CollectionIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3.5" y="4.5" width="13" height="16" rx="1.5" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} />
      <path d="M9 3.5h8a1 1 0 011 1V18" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} />
      <path d="M5 19.5c1.2-3.2 4-5 7-5s5.8 1.8 7 5" stroke="currentColor" strokeWidth={active ? 2.25 : 1.75} strokeLinecap="round" />
    </svg>
  );
}
