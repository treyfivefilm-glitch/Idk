import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getBillingState, mockCancel, mockPurchase, mockRestore, type BillingState, type PlanId } from '../services/billing';

interface BillingContextValue extends BillingState {
  purchasing: boolean;
  purchase(plan: PlanId): Promise<void>;
  cancel(): Promise<void>;
  restore(): Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BillingState>(() => getBillingState());
  const [purchasing, setPurchasing] = useState(false);

  const purchase = useCallback(async (plan: PlanId) => {
    setPurchasing(true);
    try {
      const next = await mockPurchase(plan);
      setState(next);
    } finally {
      setPurchasing(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    const next = await mockCancel();
    setState(next);
  }, []);

  const restore = useCallback(async () => {
    const next = await mockRestore();
    setState(next);
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({ ...state, purchasing, purchase, cancel, restore }),
    [state, purchasing, purchase, cancel, restore],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within a BillingProvider');
  return ctx;
}
