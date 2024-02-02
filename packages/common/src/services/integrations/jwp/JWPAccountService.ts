import InPlayer, { Env } from '@inplayer-org/inplayer.js';
import type { AccountData, FavoritesData, RegisterField, UpdateAccountData, WatchHistory } from '@inplayer-org/inplayer.js';
import i18next from 'i18next';
import { injectable } from 'inversify';

import { isCommonError } from '../../../utils/api';
import type {
  AuthData,
  ChangePassword,
  ChangePasswordWithOldPassword,
  CustomFormField,
  Customer,
  DeleteAccount,
  ExportAccountData,
  GetRegistrationFields,
  GetConsentsValues,
  GetConsents,
  Login,
  NotificationsData,
  Register,
  ResetPassword,
  GetSocialURLs,
  UpdateRegistrationFieldsValues,
  UpdateCustomerArgs,
  UpdateConsentsValues,
  UpdateFavorites,
  UpdateWatchHistory,
  UpdateCustomer,
} from '../../../../types/account';
import type { AccessModel, Config } from '../../../../types/config';
import type { InPlayerAuthData } from '../../../../types/inplayer';
import type { SerializedFavorite } from '../../../../types/favorite';
import type { SerializedWatchHistoryItem } from '../../../../types/watchHistory';
import AccountService from '../AccountService';
import StorageService from '../../StorageService';
import { ACCESS_MODEL } from '../../../constants';

import { formatRegistrationField } from './formatters/fields';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

const JW_TERMS_URL = 'https://inplayer.com/legal/terms';

@injectable()
export default class JWPAccountService extends AccountService {
  private readonly storageService;
  private clientId = '';

  accessModel: AccessModel = ACCESS_MODEL.AUTHVOD;
  assetId: number | null = null;
  svodOfferIds: string[] = [];
  sandbox = false;

  constructor(storageService: StorageService) {
    super({
      canUpdateEmail: false,
      canSupportEmptyFullName: false,
      canChangePasswordWithOldPassword: true,
      canRenewSubscription: false,
      canExportAccountData: true,
      canUpdatePaymentMethod: false,
      canShowReceipts: true,
      canDeleteAccount: true,
      hasNotifications: true,
      hasSocialURLs: true,
    });

    this.storageService = storageService;
  }

  private parseJson = (value: string, fallback = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  private formatFavorite = (favorite: FavoritesData): SerializedFavorite => {
    return {
      mediaid: favorite.media_id,
    };
  };

  private formatHistoryItem = (history: WatchHistory): SerializedWatchHistoryItem => {
    return {
      mediaid: history.media_id,
      progress: history.progress,
    };
  };

  private formatAccount = (account: AccountData): Customer => {
    const { id, uuid, email, full_name: fullName, metadata, created_at: createdAt } = account;
    const regDate = new Date(createdAt * 1000).toLocaleString();

    const firstName = metadata?.first_name as string;
    const lastName = metadata?.surname as string;

    return {
      id: id.toString(),
      uuid,
      email,
      fullName,
      firstName,
      lastName,
      metadata,
      regDate,
      country: '',
      lastUserIp: '',
    };
  };

  private formatAuth(auth: InPlayerAuthData): AuthData {
    const { access_token: jwt } = auth;
    return {
      jwt,
      refreshToken: '',
    };
  }

  initialize = async (config: Config, url: string, _logoutFn: () => Promise<void>) => {
    const jwpConfig = config.integrations?.jwp;

    if (!jwpConfig?.clientId) {
      throw new Error('Failed to initialize JWP integration. The clientId is missing.');
    }

    // set environment
    this.sandbox = !!jwpConfig.useSandbox;

    const env: string = this.sandbox ? InPlayerEnv.Development : InPlayerEnv.Production;
    InPlayer.setConfig(env as Env);

    // calculate access model
    if (jwpConfig.clientId) {
      this.clientId = jwpConfig.clientId;
    }

    if (jwpConfig.assetId) {
      this.accessModel = ACCESS_MODEL.SVOD;
      this.assetId = jwpConfig.assetId;
      this.svodOfferIds = jwpConfig.assetId ? [String(jwpConfig.assetId)] : [];
    }

    // restore session from URL params
    const queryParams = new URLSearchParams(url.split('#')[1]);
    const token = queryParams.get('token');
    const refreshToken = queryParams.get('refresh_token');
    const expires = queryParams.get('expires');

    if (!token || !refreshToken || !expires) {
      return;
    }

    InPlayer.Account.setToken(token, refreshToken, parseInt(expires));
  };

  getAuthData = async () => {
    if (InPlayer.Account.isAuthenticated()) {
      const credentials = InPlayer.Account.getToken().toObject();

      return {
        jwt: credentials.token,
        refreshToken: credentials.refreshToken,
      } as AuthData;
    }

    return null;
  };

  getConsents: GetConsents = async () => {
    try {
      const { data } = await InPlayer.Account.getRegisterFields(this.clientId);

      const termsField = data?.collection.find(({ name }) => name === 'terms');

      return termsField ? [this.getTermsConsent(termsField)] : [];
    } catch {
      throw new Error('Failed to fetch publisher consents.');
    }
  };

  getConsentsValues: GetConsentsValues = async (payload) => {
    try {
      if (!payload?.customer) {
        return {
          consents: [],
        };
      }

      const { customer } = payload;

      return this.parseJson(customer.metadata?.consents as string, []);
    } catch {
      throw new Error('Unable to fetch Customer consents.');
    }
  };

  updateConsentsValues: UpdateConsentsValues = async (payload) => {
    try {
      const { customer, consentsValues } = payload;

      const existingAccountData = this.formatUpdateAccount(customer);

      const params = {
        ...existingAccountData,
        metadata: {
          ...existingAccountData.metadata,
          consents: JSON.stringify(consentsValues),
        },
      };

      const { data } = await InPlayer.Account.updateAccount(params);

      return this.parseJson(data?.metadata?.consents as string, []);
    } catch {
      throw new Error('Unable to update Customer consents');
    }
  };

  updateRegistrationFieldsValues: UpdateRegistrationFieldsValues = async ({ customer, ...newAnswers }) => {
    return this.updateCustomer({ ...customer, ...newAnswers });
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async (payload) => {
    const { oldPassword, newPassword, newPasswordConfirmation } = payload;

    try {
      await InPlayer.Account.changePassword({
        oldPassword,
        password: newPassword,
        passwordConfirmation: newPasswordConfirmation,
      });
    } catch (error: unknown) {
      if (isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password');
    }
  };

  resetPassword: ResetPassword = async ({ customerEmail }) => {
    try {
      await InPlayer.Account.requestNewPassword({
        email: customerEmail,
        merchantUuid: this.clientId,
        brandingId: 0,
      });
    } catch {
      throw new Error('Failed to reset password.');
    }
  };

  login: Login = async ({ email, password, referrer }) => {
    try {
      const { data } = await InPlayer.Account.signInV2({
        email,
        password,
        referrer,
        clientId: this.clientId || '',
      });

      const user = this.formatAccount(data.account);
      const consentsValues = this.parseJson(user?.metadata?.consents as string, []);

      return {
        auth: this.formatAuth(data),
        user,
        consentsValues,
      };
    } catch {
      throw new Error('Failed to authenticate user.');
    }
  };

  register: Register = async ({ email, password, referrer, consentsValues }) => {
    try {
      const { data } = await InPlayer.Account.signUpV2({
        email,
        password,
        referrer,
        passwordConfirmation: password,
        fullName: email,
        metadata: {
          first_name: ' ',
          surname: ' ',
          consents: JSON.stringify(consentsValues),
        },
        type: 'consumer',
        clientId: this.clientId || '',
      });

      const user = this.formatAccount(data.account);
      const updatedConsentsValues = this.parseJson(user?.metadata?.consents as string, []);

      return {
        auth: this.formatAuth(data),
        consentsValues: updatedConsentsValues,
        user,
      };
    } catch (error: unknown) {
      if (isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create account.');
    }
  };

  logout = async () => {
    try {
      InPlayer.Notifications.unsubscribe();
      await InPlayer.Account.signOut();
    } catch {
      throw new Error('Failed to sign out.');
    }
  };

  getUser = async () => {
    try {
      const { data } = await InPlayer.Account.getAccountInfo();

      const user = this.formatAccount(data);
      const consentsValues = this.parseJson(user?.metadata?.consents as string, []);

      return {
        user,
        consentsValues,
      };
    } catch {
      throw new Error('Failed to fetch user data.');
    }
  };

  updateCustomer: UpdateCustomer = async (customer) => {
    try {
      const response = await InPlayer.Account.updateAccount(this.formatUpdateAccount(customer));

      return this.formatAccount(response.data);
    } catch {
      throw new Error('Failed to update user data.');
    }
  };

  formatUpdateAccount = (customer: UpdateCustomerArgs) => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim() || (customer.email as string);
    const metadata: Record<string, string> = {
      ...customer.metadata,
      first_name: firstName,
      surname: lastName,
    };
    const data: UpdateAccountData = {
      fullName,
      metadata,
    };

    return data;
  };

  getRegistrationFields: GetRegistrationFields = async ({ customer }) => {
    const { data } = await InPlayer.Account.getRegisterFields(this.clientId);

    const fields = data.collection.filter((field) => field.name !== 'terms').map((field) => formatRegistrationField(field, customer.metadata[field.name]));

    return {
      beforeSignUp: true,
      enabled: true,
      fields: [
        {
          type: 'input',
          label: 'First name',
          name: 'firstName',
          placeholder: 'First name',
          required: true,
          defaultValue: customer.firstName,
        },
        {
          type: 'input',
          label: 'Last name',
          name: 'lastName',
          placeholder: 'Last name',
          required: true,
          defaultValue: customer.lastName,
        },
        ...fields,
      ],
    };
  };

  changePasswordWithResetToken: ChangePassword = async (payload) => {
    const { resetPasswordToken = '', newPassword, newPasswordConfirmation = '' } = payload;
    try {
      await InPlayer.Account.setNewPassword(
        {
          password: newPassword,
          passwordConfirmation: newPasswordConfirmation,
          brandingId: 0,
        },
        resetPasswordToken,
      );
    } catch (error: unknown) {
      if (isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password.');
    }
  };

  getTermsConsent = ({ label: termsUrl }: RegisterField): CustomFormField => {
    const termsLink = `<a href="${termsUrl || JW_TERMS_URL}" target="_blank">${i18next.t('account:registration.terms_and_conditions')}</a>`;

    // t('account:registration.terms_consent_jwplayer')
    // t('account:registration.terms_consent')
    return {
      type: 'checkbox',
      isCustomRegisterField: true,
      required: true,
      name: 'terms',
      defaultValue: '',
      label: termsUrl
        ? i18next.t('account:registration.terms_consent', { termsLink })
        : i18next.t('account:registration.terms_consent_jwplayer', { termsLink }),
      enabledByDefault: false,
      placeholder: '',
      options: {},
      version: '1',
    };
  };

  updateWatchHistory: UpdateWatchHistory = async ({ history }) => {
    const savedHistory = await this.getWatchHistory();
    const savedHistoryIds = savedHistory.map((e) => e.mediaid);

    await Promise.allSettled(
      history.map(({ mediaid, progress }) => {
        if (!savedHistoryIds.includes(mediaid) || history?.some((e) => e.mediaid == mediaid && e.progress != progress)) {
          return InPlayer.Account.updateWatchHistory(mediaid, progress);
        }
      }),
    );
  };

  updateFavorites: UpdateFavorites = async ({ favorites }) => {
    const savedFavorites = await this.getFavorites();
    const currentFavoriteIds = savedFavorites.map((e) => e.mediaid) || [];
    const payloadFavoriteIds = favorites.map((e) => e.mediaid);

    // save new favorites
    await Promise.allSettled(
      payloadFavoriteIds.map((mediaId) => {
        return !currentFavoriteIds.includes(mediaId) ? InPlayer.Account.addToFavorites(mediaId) : Promise.resolve();
      }),
    );

    // delete removed favorites
    await Promise.allSettled(
      currentFavoriteIds.map((mediaId) => {
        return !payloadFavoriteIds.includes(mediaId) ? InPlayer.Account.deleteFromFavorites(mediaId) : Promise.resolve();
      }),
    );
  };

  getFavorites = async () => {
    const favoritesData = await InPlayer.Account.getFavorites();

    return favoritesData.data?.collection?.map(this.formatFavorite) || [];
  };

  getWatchHistory = async () => {
    const watchHistoryData = await InPlayer.Account.getWatchHistory({});

    return watchHistoryData.data?.collection?.map(this.formatHistoryItem) || [];
  };

  subscribeToNotifications: NotificationsData = async ({ uuid, onMessage }) => {
    try {
      if (!InPlayer.Notifications.isSubscribed()) {
        InPlayer.subscribe(uuid, {
          onMessage: onMessage,
          onOpen: () => true,
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  exportAccountData: ExportAccountData = async () => {
    // password is sent as undefined because it is now optional on BE
    try {
      const response = await InPlayer.Account.exportData({ password: undefined, brandingId: 0 });

      return response.data;
    } catch {
      throw new Error('Failed to export account data');
    }
  };

  deleteAccount: DeleteAccount = async ({ password }) => {
    try {
      const response = await InPlayer.Account.deleteAccount({ password, brandingId: 0 });

      return response.data;
    } catch {
      throw new Error('Failed to delete account');
    }
  };

  getSocialUrls: GetSocialURLs = async ({ redirectUrl }) => {
    const socialState = this.storageService.base64Encode(
      JSON.stringify({
        client_id: this.clientId || '',
        redirect: redirectUrl,
      }),
    );

    const socialResponse = await InPlayer.Account.getSocialLoginUrls(socialState);

    if (socialResponse.status !== 200) {
      throw new Error('Failed to fetch social urls');
    }

    return socialResponse.data.social_urls;
  };
}
