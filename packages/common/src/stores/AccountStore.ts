import type { CustomFormField, Customer, ConsentsValue } from '../../types/account';
import type { Offer } from '../../types/checkout';
import type { PaymentDetail, Subscription, Transaction } from '../../types/subscription';

import { createStore } from './utils';

type AccountStore = {
  loading: boolean;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  consents: CustomFormField[] | null;
  consentsValues: ConsentsValue[] | null;
  registrationFields: CustomFormField[] | null;
  registrationFieldsValues: Record<string, string | boolean> | null;
  // True when registration fields are enabled
  registrationFieldsEnabled: boolean;
  // True when the registration fields need to be shown on the create account step
  registrationFieldsOnSignUp: boolean;
  pendingOffer: Offer | null;
  setLoading: (loading: boolean) => void;
  getAccountInfo: () => { customerId: string; customer: Customer; customerConsents: ConsentsValue[] | null };
};

export const useAccountStore = createStore<AccountStore>('AccountStore', (set, get) => ({
  loading: true,
  user: null,
  subscription: null,
  transactions: null,
  activePayment: null,
  consentsValues: null,
  consents: null,
  registrationFields: null,
  registrationFieldsEnabled: false,
  registrationFieldsOnSignUp: false,
  registrationFieldsValues: null,
  pendingOffer: null,
  setLoading: (loading: boolean) => set({ loading }),
  getAccountInfo: () => {
    const user = get().user;
    const customerConsents = get().consentsValues;

    if (!user?.id) throw new Error('user not logged in');

    return { customerId: user?.id, customer: user, customerConsents };
  },
}));
