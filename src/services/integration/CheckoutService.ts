import type {
  AddAdyenPaymentDetails,
  CreateOrder,
  DeletePaymentMethod,
  FinalizeAdyenPaymentDetails,
  GetAdyenPaymentSession,
  GetEntitlements,
  GetFinalizeAdyenPayment,
  GetInitialAdyenPayment,
  GetOffers,
  GetPaymentMethods,
  GetSubscriptionSwitch,
  GetSubscriptionSwitches,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  SwitchSubscription,
  GetDirectPostCardPayment,
  UpdateOrder,
  UpdatePaymentWithPayPal,
  GetOffer, CreateOrderArgs, CreateOrderResponse,
} from '#types/checkout';

export const CheckoutServiceFactoryId = Symbol('CheckoutServiceFactory');

export type CheckoutServiceFactory = (integration: string | undefined) => CheckoutService | undefined;

export default abstract class CheckoutService {
  getOffer?(): GetOffer;

  abstract getOffers: GetOffers;

  abstract createOrder(order: CreateOrderArgs): Promise<CreateOrderResponse>;

  abstract updateOrder: UpdateOrder;

  abstract getPaymentMethods: GetPaymentMethods;

  abstract paymentWithoutDetails: PaymentWithoutDetails;

  abstract paymentWithPayPal: PaymentWithPayPal;

  abstract getEntitlements: GetEntitlements;

  abstract directPostCardPayment: GetDirectPostCardPayment;

  abstract switchSubscription: SwitchSubscription;

  abstract getSubscriptionSwitches: GetSubscriptionSwitches;

  abstract getSubscriptionSwitch: GetSubscriptionSwitch;

  abstract createAdyenPaymentSession: GetAdyenPaymentSession;

  abstract initialAdyenPayment: GetInitialAdyenPayment;

  abstract finalizeAdyenPayment: GetFinalizeAdyenPayment;

  abstract updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal;

  abstract deletePaymentMethod: DeletePaymentMethod;

  abstract addAdyenPaymentDetails: AddAdyenPaymentDetails;

  abstract finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails;
}
