import i18next from 'i18next';
import { inject, injectable } from 'inversify';

import { DEFAULT_FEATURES } from '../constants';
import { logDev } from '../utils/common';
import type { IntegrationType } from '../../types/config';
import CheckoutService from '../services/integrations/CheckoutService';
import AccountService, { type AccountServiceFeatures } from '../services/integrations/AccountService';
import SubscriptionService from '../services/integrations/SubscriptionService';
import type { Offer } from '../../types/checkout';
import type {
  Customer,
  ConsentsValue,
  EmailConfirmPasswordInput,
  FirstLastNameInput,
  SubscribeToNotificationsPayload,
  CustomFormField,
} from '../../types/account';
import { assertFeature, assertModuleMethod, getNamedModule } from '../modules/container';
import { INTEGRATION_TYPE } from '../modules/types';
import type { ServiceResponse } from '../../types/service';

import { useAccountStore } from './AccountStore';
import { useConfigStore } from './ConfigStore';
import { useProfileStore } from './ProfileStore';
import ProfileController from './ProfileController';
import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';

@injectable()
export default class AccountController {
  private readonly checkoutService: CheckoutService;
  private readonly accountService: AccountService;
  private readonly subscriptionService: SubscriptionService;
  private readonly profileController: ProfileController;
  private readonly favoritesController: FavoritesController;
  private readonly watchHistoryController: WatchHistoryController;
  private readonly features: AccountServiceFeatures;

  // temporary callback for refreshing the query cache until we've updated to react-query v4 or v5
  private refreshEntitlements: (() => Promise<void>) | undefined;

  constructor(
    @inject(INTEGRATION_TYPE) integrationType: IntegrationType,
    favoritesController: FavoritesController,
    watchHistoryController: WatchHistoryController,
    profileController: ProfileController,
  ) {
    this.checkoutService = getNamedModule(CheckoutService, integrationType);
    this.accountService = getNamedModule(AccountService, integrationType);
    this.subscriptionService = getNamedModule(SubscriptionService, integrationType);

    // @TODO: Controllers shouldn't be depending on other controllers, but we've agreed to keep this as is for now
    this.favoritesController = favoritesController;
    this.watchHistoryController = watchHistoryController;
    this.profileController = profileController;

    this.features = integrationType ? this.accountService.features : DEFAULT_FEATURES;
  }

  loadUserData = async () => {
    try {
      const authData = await this.accountService.getAuthData();

      if (authData) {
        await this.getAccount();
        await this.watchHistoryController.restoreWatchHistory();
        await this.favoritesController.restoreFavorites();
      }
    } catch (error: unknown) {
      logDev('Failed to get user', error);

      // clear the session when the token was invalid
      // don't clear the session when the error is unknown (network hiccup or something similar)
      if (error instanceof Error && error.message.includes('Invalid JWT token')) {
        await this.logout();
      }
    }
  };

  initialize = async (url: string, refreshEntitlements?: () => Promise<void>) => {
    this.refreshEntitlements = refreshEntitlements;

    useAccountStore.setState({ loading: true });
    const config = useConfigStore.getState().config;

    await this.profileController?.loadPersistedProfile();
    await this.accountService.initialize(config, url, this.logout);

    // set the accessModel before restoring the user session
    useConfigStore.setState({ accessModel: this.accountService.accessModel });

    await this.loadUserData();

    useAccountStore.setState({ loading: false });
  };

  getSandbox() {
    return this.accountService.sandbox;
  }

  updateUser = async (values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<ServiceResponse<Customer>> => {
    useAccountStore.setState({ loading: true });

    const { user } = useAccountStore.getState();
    const { canUpdateEmail, canSupportEmptyFullName } = this.getFeatures();

    if (Object.prototype.hasOwnProperty.call(values, 'email') && !canUpdateEmail) {
      throw new Error('Email update not supported');
    }

    if (!user) {
      throw new Error('User not logged in');
    }

    const errors = this.validateInputLength(values as FirstLastNameInput);
    if (errors.length) {
      return {
        errors,
        responseData: {} as Customer,
      };
    }

    let payload = values;
    // this is needed as a fallback when the name is empty (cannot be empty on JWP integration)
    if (!canSupportEmptyFullName) {
      payload = { ...values, email: user.email };
    }

    const updatedUser = await this.accountService.updateCustomer({ ...payload, id: user.id.toString() });

    if (!updatedUser) {
      throw new Error('Unknown error');
    }

    useAccountStore.setState({ user: updatedUser });

    return { errors: [], responseData: updatedUser };
  };

  getAccount = async () => {
    const { config } = useConfigStore.getState();

    try {
      const response = await this.accountService.getUser({ config });
      if (response) {
        await this.afterLogin(response.user, response.customerConsents);
        await this.favoritesController.restoreFavorites().catch(logDev);
        await this.watchHistoryController.restoreWatchHistory().catch(logDev);
      }

      useAccountStore.setState({ loading: false });
    } catch (error: unknown) {
      useAccountStore.setState({
        user: null,
        subscription: null,
        transactions: null,
        activePayment: null,
        customerConsents: null,
        publisherConsents: null,
        loading: false,
      });
    }
  };

  login = async (email: string, password: string, referrer: string) => {
    useAccountStore.setState({ loading: true });

    const response = await this.accountService.login({ email, password, referrer });

    if (response) {
      await this.afterLogin(response.user, response.customerConsents);
    }

    useAccountStore.setState({ loading: false });
  };

  logout = async () => {
    await this.accountService?.logout();
    await this.clearLoginState();

    // let the application know to refresh all entitlements
    await this.refreshEntitlements?.();
  };

  register = async (email: string, password: string, referrer: string, consents: ConsentsValue[]) => {
    useAccountStore.setState({ loading: true });
    const response = await this.accountService.register({ email, password, consents, referrer });

    if (response) {
      const { user, customerConsents } = response;
      await this.afterLogin(user, customerConsents);
    }

    // this stores the locally stored favorites and watch history into the users account
    await this.favoritesController.persistFavorites();
    await this.watchHistoryController.persistWatchHistory();
  };

  updateConsents = async (customerConsents: ConsentsValue[]): Promise<ServiceResponse<ConsentsValue[]>> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    useAccountStore.setState({ loading: true });

    try {
      const updatedConsents = await this.accountService?.updateConsentsValues({
        customer,
        consents: customerConsents,
      });

      if (updatedConsents) {
        useAccountStore.setState({ customerConsents: updatedConsents });
        return {
          responseData: updatedConsents,
          errors: [],
        };
      }
      return {
        responseData: [],
        errors: [],
      };
    } finally {
      useAccountStore.setState({ loading: false });
    }
  };

  // TODO: Decide if it's worth keeping this or just leave combined with getUser
  // noinspection JSUnusedGlobalSymbols
  getCustomerConsents = async () => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    const consents = await this.accountService.getConsentsValues({ customer });

    if (consents) {
      useAccountStore.setState({ customerConsents: consents });
    }

    return consents;
  };

  getPublisherConsents = async () => {
    const { config } = useConfigStore.getState();

    const consents = await this.accountService.getConsents(config);

    useAccountStore.setState({ publisherConsents: consents });

    return consents;
  };

  getRegistrationFields = async () => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer } = getAccountInfo();

    return this.accountService.getRegistrationFields({ customer });
  };

  updateRegistrationFieldsValues = async (fields: CustomFormField[], values: Record<string, string>) => {
    const { getAccountInfo } = useAccountStore.getState();
    const { customer, customerConsents } = getAccountInfo();

    const updatedCustomer = await this.accountService.updateRegistrationFieldsValues({ customer, fields, values });

    await this.afterLogin(updatedCustomer, customerConsents, false);

    return updatedCustomer;
  };

  resetPassword = async (email: string, resetUrl: string) => {
    await this.accountService.resetPassword({
      customerEmail: email,
      resetUrl,
    });
  };

  changePasswordWithOldPassword = async (oldPassword: string, newPassword: string, newPasswordConfirmation: string) => {
    await this.accountService.changePasswordWithOldPassword({
      oldPassword,
      newPassword,
      newPasswordConfirmation,
    });
  };

  changePasswordWithToken = async (customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) => {
    await this.accountService.changePasswordWithResetToken({
      customerEmail,
      newPassword,
      resetPasswordToken,
      newPasswordConfirmation,
    });
  };

  updateSubscription = async (status: 'active' | 'cancelled'): Promise<unknown> => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    const { subscription } = useAccountStore.getState();
    if (!subscription) throw new Error('user has no active subscription');

    const response = await this.subscriptionService?.updateSubscription({
      customerId,
      offerId: subscription.offerId,
      status,
      unsubscribeUrl: subscription.unsubscribeUrl,
    });

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.reloadSubscriptions({ delay: 2000 });

    return response?.responseData;
  };

  updateCardDetails = async ({
    cardName,
    cardNumber,
    cvc,
    expMonth,
    expYear,
    currency,
  }: {
    cardName: string;
    cardNumber: string;
    cvc: number;
    expMonth: number;
    expYear: number;
    currency: string;
  }) => {
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    assertModuleMethod(this.subscriptionService.updateCardDetails, 'updateCardDetails is not available in subscription service');

    const response = await this.subscriptionService.updateCardDetails({
      cardName,
      cardNumber,
      cvc,
      expMonth,
      expYear,
      currency,
    });
    const activePayment = (await this.subscriptionService.getActivePayment({ customerId })) || null;

    useAccountStore.setState({
      loading: false,
      activePayment,
    });
    return response;
  };

  checkEntitlements = async (offerId?: string): Promise<unknown> => {
    if (!offerId) {
      return false;
    }

    const { responseData } = await this.checkoutService.getEntitlements({ offerId });
    return !!responseData?.accessGranted;
  };

  reloadSubscriptions = async ({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> => {
    useAccountStore.setState({ loading: true });

    const { getAccountInfo } = useAccountStore.getState();
    const { customerId } = getAccountInfo();
    const { accessModel } = useConfigStore.getState();

    // The subscription data takes a few seconds to load after it's purchased,
    // so here's a delay mechanism to give it time to process
    if (delay > 0) {
      return new Promise((resolve: (value?: unknown) => void) => {
        setTimeout(() => {
          this.reloadSubscriptions().finally(resolve);
        }, delay);
      });
    }

    // For non-SVOD platforms, there could be TVOD items, so we only reload entitlements
    if (accessModel !== 'SVOD') {
      await this.refreshEntitlements?.();

      return useAccountStore.setState({ loading: true });
    }

    const [activeSubscription, transactions, activePayment] = await Promise.all([
      this.subscriptionService.getActiveSubscription({ customerId }),
      this.subscriptionService.getAllTransactions({ customerId }),
      this.subscriptionService.getActivePayment({ customerId }),
    ]);

    let pendingOffer: Offer | null = null;

    // resolve and fetch the pending offer after upgrade/downgrade
    try {
      if (activeSubscription?.pendingSwitchId) {
        assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');
        assertModuleMethod(this.checkoutService.getSubscriptionSwitch, 'getSubscriptionSwitch is not available in checkout service');

        const switchOffer = await this.checkoutService.getSubscriptionSwitch({ switchId: activeSubscription.pendingSwitchId });
        const offerResponse = await this.checkoutService.getOffer({ offerId: switchOffer.responseData.toOfferId });

        pendingOffer = offerResponse.responseData;
      }
    } catch (error: unknown) {
      logDev('Failed to fetch the pending offer', error);
    }

    // let the app know to refresh the entitlements
    await this.refreshEntitlements?.();

    useAccountStore.setState({
      subscription: activeSubscription,
      loading: false,
      pendingOffer,
      transactions,
      activePayment,
    });
  };

  exportAccountData = async () => {
    const { canExportAccountData } = this.getFeatures();

    assertModuleMethod(this.accountService.exportAccountData, 'exportAccountData is not available in account service');
    assertFeature(canExportAccountData, 'Export account');

    return this.accountService?.exportAccountData(undefined);
  };

  getSocialLoginUrls = (redirectUrl: string) => {
    const { hasSocialURLs } = this.getFeatures();

    assertModuleMethod(this.accountService.getSocialUrls, 'getSocialUrls is not available in account service');
    assertFeature(hasSocialURLs, 'Social logins');

    return this.accountService.getSocialUrls({ redirectUrl });
  };

  deleteAccountData = async (password: string) => {
    const { canDeleteAccount } = this.getFeatures();

    assertModuleMethod(this.accountService.deleteAccount, 'deleteAccount is not available in account service');
    assertFeature(canDeleteAccount, 'Delete account');

    return this.accountService.deleteAccount({ password });
  };

  getReceipt = async (transactionId: string) => {
    assertModuleMethod(this.subscriptionService.fetchReceipt, 'fetchReceipt is not available in subscription service');

    const { responseData } = await this.subscriptionService.fetchReceipt({ transactionId });

    return responseData;
  };

  getAuthData = async () => {
    return this.accountService.getAuthData();
  };

  subscribeToNotifications = async ({ uuid, onMessage }: SubscribeToNotificationsPayload) => {
    return this.accountService.subscribeToNotifications({ uuid, onMessage });
  };

  getFeatures() {
    return this.features;
  }

  private async afterLogin(user: Customer, customerConsents: ConsentsValue[] | null, shouldReloadSubscription = true) {
    useAccountStore.setState({
      user,
      customerConsents,
    });

    await Promise.allSettled([shouldReloadSubscription ? this.reloadSubscriptions() : Promise.resolve(), this.getPublisherConsents()]);
    useAccountStore.setState({ loading: false });
  }

  private validateInputLength = (values: { firstName: string; lastName: string }) => {
    const errors: string[] = [];
    if (Number(values?.firstName?.length) > 50) {
      errors.push(i18next.t('account:validation.first_name'));
    }
    if (Number(values?.lastName?.length) > 50) {
      errors.push(i18next.t('account:validation.last_name'));
    }

    return errors;
  };

  private clearLoginState = async () => {
    useAccountStore.setState({
      user: null,
      subscription: null,
      transactions: null,
      activePayment: null,
      customerConsents: null,
      publisherConsents: null,
      loading: false,
    });

    useProfileStore.setState({
      profile: null,
      selectingProfileAvatar: null,
    });

    this.profileController.unpersistProfile();

    await this.favoritesController.restoreFavorites().catch(logDev);
    await this.watchHistoryController.restoreWatchHistory().catch(logDev);
  };
}
