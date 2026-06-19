import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { BillingContext, type BillingContextValue } from './billing-context';
import { getBillingState, mockCancel, mockPurchase, mockRestore, type BillingState, type PlanId } from '../services/billing';

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
