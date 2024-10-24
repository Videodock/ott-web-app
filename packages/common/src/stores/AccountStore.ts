import type { Plan } from '../../types/plans';
import type { CustomFormField, Customer, CustomerConsent } from '../../types/account';
import type { Offer } from '../../types/checkout';
import type { PaymentDetail, Subscription, Transaction } from '../../types/subscription';

import { createStore } from './utils';

type AccountStore = {
  loading: boolean;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  entitledPlan: Plan | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: CustomFormField[] | null;
  publisherConsentsLoading: boolean;
  pendingOffer: Offer | null;
  setLoading: (loading: boolean) => void;
  getAccountInfo: () => { customerId: string; customer: Customer; customerConsents: CustomerConsent[] | null };
};

export const useAccountStore = createStore<AccountStore>('AccountStore', (set, get) => ({
  loading: false,
  user: null,
  subscription: null,
  transactions: null,
  entitledPlan: null,
  activePayment: null,
  customerConsents: null,
  publisherConsents: null,
  publisherConsentsLoading: false,
  pendingOffer: null,
  setLoading: (loading: boolean) => set({ loading }),
  getAccountInfo: () => {
    const user = get().user;
    const customerConsents = get().customerConsents;

    if (!user?.id) throw new Error('user not logged in');

    return { customerId: user?.id, customer: user, customerConsents };
  },
}));
