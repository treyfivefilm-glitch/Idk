import { createContext } from 'react';
import type { BillingState, PlanId } from '../services/billing';

export interface BillingContextValue extends BillingState {
  purchasing: boolean;
  purchase(plan: PlanId): Promise<void>;
  cancel(): Promise<void>;
  restore(): Promise<void>;
}

export const BillingContext = createContext<BillingContextValue | undefined>(undefined);
