import { injectable } from 'inversify';

import { createURL } from '../../../utils/urlFormatting';
import type {
  FetchReceipt,
  GetActivePayment,
  GetActiveSubscription,
  GetAllTransactions,
  GetPaymentDetails,
  GetSubscriptions,
  GetTransactions,
  UpdateSubscription,
} from '../../../../types/subscription';
import SubscriptionService from '../SubscriptionService';

import CleengService from './CleengService';

@injectable()
export default class CleengSubscriptionService extends SubscriptionService {
  private readonly cleengService: CleengService;

  constructor(cleengService: CleengService) {
    super();
    this.cleengService = cleengService;
  }

  getActiveSubscription: GetActiveSubscription = async ({ sandbox, customerId }) => {
    const response = await this.getSubscriptions({ customerId }, sandbox);

    if (response.errors.length > 0) return null;

    return response.responseData.items.find((item) => item.status === 'active' || item.status === 'cancelled') || null;
  };

  getAllTransactions: GetAllTransactions = async ({ sandbox, customerId }) => {
    const response = await this.getTransactions({ customerId }, sandbox);

    if (response.errors.length > 0) return null;

    return response.responseData.items;
  };

  getActivePayment: GetActivePayment = async ({ sandbox, customerId }) => {
    const response = await this.getPaymentDetails({ customerId }, sandbox);

    if (response.errors.length > 0) return null;

    return response.responseData.paymentDetails.find((paymentDetails) => paymentDetails.active) || null;
  };

  getSubscriptions: GetSubscriptions = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/customers/${payload.customerId}/subscriptions`, { authenticate: true });
  };

  updateSubscription: UpdateSubscription = async (payload, sandbox) => {
    return this.cleengService.patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), { authenticate: true });
  };

  getPaymentDetails: GetPaymentDetails = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/customers/${payload.customerId}/payment_details`, { authenticate: true });
  };

  getTransactions: GetTransactions = async ({ customerId, limit, offset }, sandbox) => {
    return this.cleengService.get(sandbox, createURL(`/customers/${customerId}/transactions`, { limit, offset }), { authenticate: true });
  };

  fetchReceipt: FetchReceipt = async ({ transactionId }, sandbox) => {
    return this.cleengService.get(sandbox, `/receipt/${transactionId}`, { authenticate: true });
  };

  updateCardDetails: undefined;

  changeSubscription: undefined;
}
