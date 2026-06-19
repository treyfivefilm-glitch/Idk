import { Link } from 'react-router-dom';

export function UpsellCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand/40 bg-brand-soft/40 p-4 text-center">
      <p className="text-sm text-brand-dark">{message}</p>
      <Link
        to="/paywall"
        className="mt-2 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        See plans
      </Link>
    </div>
  );
}
