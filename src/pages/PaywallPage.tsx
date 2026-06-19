import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useBilling } from '../context/useBilling';
import { PLAN_PRICES, type PlanId } from '../services/billing';
import { FREE_COLLECTION_LIMIT } from '../lib/limits';

const FEATURES: { label: string; free: boolean; pro: boolean }[] = [
  { label: 'Identify by search, cover scan, or barcode', free: true, pro: true },
  { label: 'Basic raw asking-price range', free: true, pro: true },
  { label: 'Save comics to your collection', free: true, pro: true },
  { label: `Unlimited collection size (free capped at ${FREE_COLLECTION_LIMIT})`, free: false, pro: true },
  { label: 'Full raw listing history', free: false, pro: true },
  { label: 'Graded (CGC/CBCS) sold-price estimates & history', free: false, pro: true },
  { label: 'Collection value history & tracking', free: false, pro: true },
  { label: 'Collection CSV export', free: false, pro: true },
];

export function PaywallPage() {
  const navigate = useNavigate();
  const { isPro, purchasing, purchase } = useBilling();
  const [plan, setPlan] = useState<PlanId>('monthly');
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubscribe() {
    await purchase(plan);
    setConfirmed(true);
  }

  if (isPro || confirmed) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="PanelWorth Pro" showBack />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-value-soft text-value">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-ink">You're on Pro</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Unlimited collection size, full raw &amp; graded history, value tracking, and CSV export are unlocked.
          </p>
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Manage subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="PanelWorth Pro" showBack />

      <div className="space-y-5 px-4 py-4">
        <p className="text-sm text-ink-soft">
          Identifying comics and seeing a basic value range is always free. Pro adds the full pricing picture.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-ink-soft">
                <th className="px-3 py-2">Feature</th>
                <th className="px-3 py-2 text-center">Free</th>
                <th className="px-3 py-2 text-center">Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.label} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-ink">{f.label}</td>
                  <td className="px-3 py-2 text-center">{f.free ? <Check /> : <Dash />}</td>
                  <td className="px-3 py-2 text-center">{f.pro ? <Check /> : <Dash />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-ink">Choose a plan</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(PLAN_PRICES) as PlanId[]).map((p) => {
              const selected = plan === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setPlan(p)}
                  className={`rounded-xl border px-3 py-3 text-left ${
                    selected ? 'border-brand bg-brand-soft text-brand-dark' : 'border-slate-200 text-ink-soft'
                  }`}
                >
                  <span className="block text-sm font-semibold capitalize">{p}</span>
                  <span className="block text-xs">
                    {PLAN_PRICES[p].amount} / {PLAN_PRICES[p].per}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={purchasing}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {purchasing ? 'Processing…' : `Subscribe — ${PLAN_PRICES[plan].amount}/${PLAN_PRICES[plan].per}`}
        </button>

        <p className="text-center text-xs text-ink-soft">
          Cancel anytime, in one tap, right from the Account tab. No countdowns, no pre-checked add-ons.
        </p>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-4 w-4 text-value" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dash() {
  return <span className="text-ink-soft">—</span>;
}
