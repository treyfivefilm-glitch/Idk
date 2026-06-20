import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { BottomSheet } from '../components/BottomSheet';
import { useBilling } from '../context/useBilling';
import { useCollection } from '../context/useCollection';
import { FREE_COLLECTION_LIMIT } from '../lib/limits';

export function AccountPage() {
  const { isPro, plan, renewsAt, cancel, restore } = useBilling();
  const { items } = useCollection();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
              className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
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

        <div className="rounded-2xl border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setMethodologyOpen(true)}
            className="block w-full text-left text-sm font-semibold text-ink"
          >
            How values are calculated
          </button>
          <div className="my-3 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            className="block w-full text-left text-sm font-semibold text-ink"
          >
            Privacy &amp; terms
          </button>
          <div className="my-3 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="block w-full text-left text-sm font-semibold text-ink"
          >
            Help &amp; support
          </button>
        </div>

        <p className="px-1 text-center text-xs text-ink-soft">
          Billing is mocked in this build — no real charge happens here. See the README for how to wire up
          RevenueCat for production.
        </p>
      </div>

      <BottomSheet open={methodologyOpen} title="How values are calculated" onClose={() => setMethodologyOpen(false)}>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>
            Raw comes from currently-listed asking prices; graded comes from actual sold sales. We never blend the
            two into one number.
          </li>
          <li>We drop the single highest and single lowest entry, since those are usually outliers.</li>
          <li>We report the low–high range and median of what's left.</li>
          <li>We adjust the raw range for the condition you select. A certified grade already accounts for condition.</li>
        </ol>
      </BottomSheet>

      <BottomSheet open={privacyOpen} title="Privacy & terms" onClose={() => setPrivacyOpen(false)}>
        <p className="text-sm text-ink-soft">
          This is a demo build of PanelWorth. Your collection and any photos you add are stored only on this
          device — nothing is uploaded to a server. A full privacy policy and terms of service will be published
          here before any public launch.
        </p>
      </BottomSheet>

      <BottomSheet open={helpOpen} title="Help & support" onClose={() => setHelpOpen(false)}>
        <p className="text-sm text-ink-soft">
          PanelWorth is still in development. If something looks wrong or you have a question, support channels
          will be listed here once this app is live.
        </p>
      </BottomSheet>
    </div>
  );
}
