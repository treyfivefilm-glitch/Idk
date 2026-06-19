import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useBilling } from '../context/useBilling';
import { useCollection } from '../context/useCollection';
import { FREE_COLLECTION_LIMIT } from '../lib/limits';

export function AccountPage() {
  const { isPro, plan, renewsAt, cancel, restore } = useBilling();
  const { items } = useCollection();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  async function handleCancel() {
    await cancel();
    setConfirmingCancel(false);
    setJustCancelled(true);
  }

  async function handleRestore() {
    setRestoring(true);
    await restore();
    setRestoring(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Account" />

      <div className="space-y-4 px-4 py-4">
        {justCancelled ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-ink-soft">
            You've moved to the Free plan. You can resubscribe anytime — no hard feelings.
          </p>
        ) : null}

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Current plan</p>
          <p className="mt-1 text-lg font-bold text-ink">{isPro ? 'PanelWorth Pro' : 'Free'}</p>
          {isPro && renewsAt ? (
            <p className="mt-0.5 text-sm text-ink-soft">
              {plan === 'annual' ? 'Renews yearly' : 'Renews monthly'} · next renewal{' '}
              {new Date(renewsAt).toLocaleDateString()}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-ink-soft">Identify comics and see a basic value range, free forever.</p>
          )}

          {!isPro ? (
            <Link
              to="/paywall"
              className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade to Pro
            </Link>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Collection</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {items.length}
            {isPro ? '' : ` of ${FREE_COLLECTION_LIMIT}`} comic{items.length === 1 ? '' : 's'}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {isPro
              ? 'Unlimited on PanelWorth Pro.'
              : `Free plan — capped at ${FREE_COLLECTION_LIMIT} comics combined across all boxes.`}
          </p>
        </div>

        {isPro ? (
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-ink">Manage subscription</p>
            {!confirmingCancel ? (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="mt-2 text-sm font-semibold text-danger hover:underline"
              >
                Cancel subscription
              </button>
            ) : (
              <div className="mt-2 rounded-xl bg-danger-soft p-3">
                <p className="text-sm text-danger">
                  Cancel PanelWorth Pro? You'll keep access to the basic free features.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full bg-danger px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Yes, cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(false)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-ink"
                  >
                    Keep Pro
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-ink">Already paid?</p>
          <p className="mt-0.5 text-sm text-ink-soft">Restore a previous purchase on this device.</p>
          <button
            type="button"
            onClick={handleRestore}
            disabled={restoring}
            className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {restoring ? 'Restoring…' : 'Restore purchases'}
          </button>
        </div>

        <p className="px-1 text-center text-xs text-ink-soft">
          Billing is mocked in this build — no real charge happens here. See the README for how to wire up
          RevenueCat for production.
        </p>
      </div>
    </div>
  );
}
