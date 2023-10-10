import type {
  ChangeSubscription,
  FetchReceipt,
  GetPaymentDetails,
  GetActivePayment,
  GetSubscriptions,
  GetTransactions,
  UpdateCardDetails,
  UpdateSubscription,
  GetAllTransactions,
  GetActiveSubscription,
} from '#types/subscription';

export const SubscriptionServiceFactoryId = Symbol('SubscriptionServiceFactory');

export type SubscriptionServiceFactory = (integration: string | undefined) => SubscriptionService | undefined;

export default abstract class SubscriptionService {
  abstract getActiveSubscription: GetActiveSubscription;

  abstract getAllTransactions: GetAllTransactions;

  abstract getActivePayment: GetActivePayment;

  abstract getSubscriptions: GetSubscriptions;

  abstract updateSubscription: UpdateSubscription;

  abstract changeSubscription: ChangeSubscription;

  abstract updateCardDetails: UpdateCardDetails;

  abstract getPaymentDetails: GetPaymentDetails;

  abstract getTransactions: GetTransactions;

  abstract fetchReceipt: FetchReceipt;
}
