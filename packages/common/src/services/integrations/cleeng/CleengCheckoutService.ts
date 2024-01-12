import { inject, injectable } from 'inversify';

import type {
  AddAdyenPaymentDetails,
  CreateOrder,
  CreateOrderPayload,
  DeletePaymentMethod,
  FinalizeAdyenPaymentDetails,
  GetAdyenPaymentSession,
  GetEntitlements,
  GetFinalizeAdyenPayment,
  GetInitialAdyenPayment,
  GetOffer,
  GetOffers,
  GetOrder,
  GetPaymentMethods,
  GetSubscriptionSwitch,
  GetSubscriptionSwitches,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  SwitchSubscription,
  UpdateOrder,
  UpdatePaymentWithPayPal,
} from '../../../../types/checkout';
import CheckoutService from '../CheckoutService';
import { GET_CUSTOMER_IP } from '../../../modules/types';
import type { GetCustomerIP } from '../../../../types/get-customer-ip';

import CleengService from './CleengService';

@injectable()
export default class CleengCheckoutService extends CheckoutService {
  private readonly cleengService: CleengService;
  private readonly getCustomerIP: GetCustomerIP;

  constructor(cleengService: CleengService, @inject(GET_CUSTOMER_IP) getCustomerIP: GetCustomerIP) {
    super();
    this.cleengService = cleengService;
    this.getCustomerIP = getCustomerIP;
  }

  getOffers: GetOffers = async (payload, sandbox) => {
    return await Promise.all(
      payload.offerIds.map(async (offerId) => {
        const response = await this.getOffer({ offerId: offerId as string }, sandbox);

        if (response.errors.length > 0) {
          throw new Error(response.errors[0]);
        }

        return response.responseData;
      }),
    );
  };

  getOffer: GetOffer = async (payload, sandbox) => {
    const customerIP = await this.getCustomerIP();

    return this.cleengService.get(sandbox, `/offers/${payload.offerId}${customerIP ? '?customerIP=' + customerIP : ''}`);
  };

  createOrder: CreateOrder = async (payload, sandbox) => {
    const locales = await this.cleengService.getLocales(sandbox);

    if (locales.errors.length > 0) throw new Error(locales.errors[0]);

    const createOrderPayload: CreateOrderPayload = {
      offerId: payload.offer.offerId,
      customerId: payload.customerId,
      country: payload.country,
      currency: locales?.responseData?.currency || 'EUR',
      customerIP: payload.customerIP,
      paymentMethodId: payload.paymentMethodId,
    };

    return this.cleengService.post(sandbox, '/orders', JSON.stringify(createOrderPayload), { authenticate: true });
  };

  getOrder: GetOrder = async ({ orderId }, sandbox) => {
    return this.cleengService.get(sandbox, `/orders/${orderId}`, { authenticate: true });
  };

  updateOrder: UpdateOrder = async ({ order, ...payload }, sandbox) => {
    return this.cleengService.patch(sandbox, `/orders/${order.id}`, JSON.stringify(payload), { authenticate: true });
  };

  getPaymentMethods: GetPaymentMethods = async (sandbox) => {
    return this.cleengService.get(sandbox, '/payment-methods', { authenticate: true });
  };

  paymentWithoutDetails: PaymentWithoutDetails = async (payload, sandbox) => {
    return this.cleengService.post(sandbox, '/payments', JSON.stringify(payload), { authenticate: true });
  };

  paymentWithPayPal: PaymentWithPayPal = async (payload, sandbox) => {
    const { order, successUrl, cancelUrl, errorUrl } = payload;

    const paypalPayload = {
      orderId: order.id,
      successUrl,
      cancelUrl,
      errorUrl,
    };

    return this.cleengService.post(sandbox, '/connectors/paypal/v1/tokens', JSON.stringify(paypalPayload), { authenticate: true });
  };

  getSubscriptionSwitches: GetSubscriptionSwitches = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/customers/${payload.customerId}/subscription_switches/${payload.offerId}/availability`, { authenticate: true });
  };

  getSubscriptionSwitch: GetSubscriptionSwitch = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/subscription_switches/${payload.switchId}`, { authenticate: true });
  };

  switchSubscription: SwitchSubscription = async (payload, sandbox) => {
    return this.cleengService.post(
      sandbox,
      `/customers/${payload.customerId}/subscription_switches/${payload.offerId}`,
      JSON.stringify({ toOfferId: payload.toOfferId, switchDirection: payload.switchDirection }),
      { authenticate: true },
    );
  };

  getEntitlements: GetEntitlements = async (payload, sandbox) => {
    return this.cleengService.get(sandbox, `/entitlements/${payload.offerId}`, { authenticate: true });
  };

  createAdyenPaymentSession: GetAdyenPaymentSession = async (payload, sandbox) => {
    return await this.cleengService.post(sandbox, '/connectors/adyen/sessions', JSON.stringify(payload), { authenticate: true });
  };

  initialAdyenPayment: GetInitialAdyenPayment = async (payload, sandbox) =>
    this.cleengService.post(sandbox, '/connectors/adyen/initial-payment', JSON.stringify(payload), { authenticate: true });

  finalizeAdyenPayment: GetFinalizeAdyenPayment = async (payload, sandbox) =>
    this.cleengService.post(sandbox, '/connectors/adyen/initial-payment/finalize', JSON.stringify(payload), { authenticate: true });

  updatePaymentMethodWithPayPal: UpdatePaymentWithPayPal = async (payload, sandbox) => {
    return this.cleengService.post(sandbox, '/connectors/paypal/v1/payment_details/tokens', JSON.stringify(payload), { authenticate: true });
  };

  deletePaymentMethod: DeletePaymentMethod = async (payload, sandbox) => {
    return this.cleengService.remove(sandbox, `/payment_details/${payload.paymentDetailsId}`, { authenticate: true });
  };

  addAdyenPaymentDetails: AddAdyenPaymentDetails = async (payload, sandbox) =>
    this.cleengService.post(sandbox, '/connectors/adyen/payment-details', JSON.stringify(payload), { authenticate: true });

  finalizeAdyenPaymentDetails: FinalizeAdyenPaymentDetails = async (payload, sandbox) =>
    this.cleengService.post(sandbox, '/connectors/adyen/payment-details/finalize', JSON.stringify(payload), { authenticate: true });

  directPostCardPayment = async () => false;
}
