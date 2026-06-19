export type PlanId = 'monthly' | 'annual';

export interface BillingState {
  isPro: boolean;
  plan?: PlanId;
  renewsAt?: string;
}

export const PLAN_PRICES: Record<PlanId, { amount: string; per: string }> = {
  monthly: { amount: '$4.99', per: 'month' },
  annual: { amount: '$39.99', per: 'year' },
};

const STORAGE_KEY = 'panelworth.billing.v1';

function read(): BillingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BillingState) : { isPro: false };
  } catch {
    return { isPro: false };
  }
}

function write(state: BillingState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * ============================================================================
 * MOCK BILLING — scaffolding only, swap for RevenueCat in production.
 * ============================================================================
 * Live integration sketch:
 *   1. `npm install @revenuecat/purchases-js` (web) or the Expo/RN SDK for
 *      the mobile port, and configure products/entitlements in the
 *      RevenueCat dashboard (one "pro" entitlement covering monthly + annual).
 *   2. Replace `mockPurchase` with `Purchases.purchase({ rcPackage })` and
 *      read `customerInfo.entitlements.active.pro` for `isPro`.
 *   3. Replace `mockCancel`'s local toggle with deep-linking the user to the
 *      platform subscription management page (App Store / Play Store /
 *      Stripe customer portal for web) — apps cannot cancel an IAP
 *      programmatically, only the store can.
 *   4. Replace `mockRestore` with `Purchases.restorePurchases()`.
 *
 * Required env vars once live: REVENUECAT_PUBLIC_API_KEY (see README).
 * ============================================================================
 */
export function getBillingState(): BillingState {
  return read();
}

export async function mockPurchase(plan: PlanId): Promise<BillingState> {
  await new Promise((resolve) => setTimeout(resolve, 700)); // simulate store round-trip
  const renewsAt = new Date();
  renewsAt.setDate(renewsAt.getDate() + (plan === 'annual' ? 365 : 30));
  const state: BillingState = { isPro: true, plan, renewsAt: renewsAt.toISOString() };
  write(state);
  return state;
}

export async function mockCancel(): Promise<BillingState> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const state: BillingState = { isPro: false };
  write(state);
  return state;
}

export async function mockRestore(): Promise<BillingState> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return read();
}
