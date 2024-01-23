import InPlayer, { Env } from '@inplayer-org/inplayer.js';
import type { AccountData, FavoritesData, RegisterField, UpdateAccountData, WatchHistory } from '@inplayer-org/inplayer.js';
import i18next from 'i18next';
import { injectable } from 'inversify';

import { formatConsentsToRegisterFields } from '../../../utils/collection';
import { getCommonResponseData, isCommonError } from '../../../utils/api';
import type {
  AuthData,
  Capture,
  ChangePassword,
  ChangePasswordWithOldPassword,
  Consent,
  Customer,
  CustomerConsent,
  CustomRegisterFieldVariant,
  DeleteAccount,
  ExportAccountData,
  ExternalData,
  GetCaptureStatus,
  GetCustomerConsents,
  GetCustomerConsentsResponse,
  GetPublisherConsents,
  Login,
  NotificationsData,
  Register,
  ResetPassword,
  GetSocialURLs,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerArgs,
  UpdateCustomerConsents,
  UpdatePersonalShelves,
} from '../../../../types/account';
import type { AccessModel, Config } from '../../../../types/config';
import type { InPlayerAuthData } from '../../../../types/inplayer';
import type { Favorite } from '../../../../types/favorite';
import type { WatchHistoryItem } from '../../../../types/watchHistory';
import AccountService from '../AccountService';
import StorageService from '../../StorageService';
import { ACCESS_MODEL } from '../../../constants';
import type { ServiceResponse } from '../../../../types/service';

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

  private getCustomerExternalData = async (): Promise<ExternalData> => {
    const [favoritesData, historyData] = await Promise.all([InPlayer.Account.getFavorites(), await InPlayer.Account.getWatchHistory({})]);

    const favorites = favoritesData.data?.collection?.map((favorite: FavoritesData) => {
      return this.formatFavorite(favorite);
    });

    const history = historyData.data?.collection?.map((history: WatchHistory) => {
      return this.formatHistoryItem(history);
    });

    return {
      favorites,
      history,
    };
  };

  private parseJson = (value: string, fallback = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  private formatFavorite = (favorite: FavoritesData): Favorite => {
    return {
      mediaid: favorite.media_id,
    } as Favorite;
  };

  private formatHistoryItem = (history: WatchHistory): WatchHistoryItem => {
    return {
      mediaid: history.media_id,
      progress: history.progress,
    } as WatchHistoryItem;
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

  getPublisherConsents: GetPublisherConsents = async () => {
    try {
      const { data } = await InPlayer.Account.getRegisterFields(this.clientId);

      const terms = data?.collection.find(({ name }) => name === 'terms');

      const result = data?.collection
        // we exclude these fields because we already have them by default
        .filter((field) => !['email_confirmation', 'first_name', 'surname'].includes(field.name) && ![terms].includes(field))
        .map(
          (field): Consent => ({
            type: field.type as CustomRegisterFieldVariant,
            isCustomRegisterField: true,
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            version: '1',
            ...(field.type === 'checkbox'
              ? {
                  enabledByDefault: field.default_value === 'true',
                }
              : {
                  defaultValue: field.default_value,
                }),
          }),
        );

      const consents = terms ? [this.getTermsConsent(terms), ...result] : result;

      return { consents };
    } catch {
      throw new Error('Failed to fetch publisher consents.');
    }
  };

  getCustomerConsents: GetCustomerConsents = async (payload) => {
    try {
      if (!payload?.customer) {
        return {
          consents: [],
        };
      }

      const { customer } = payload;
      const consents: GetCustomerConsentsResponse = this.parseJson(customer.metadata?.consents as string, []);

      return consents;
    } catch {
      throw new Error('Unable to fetch Customer consents.');
    }
  };

  updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
    try {
      const { customer, consents } = payload;

      const existingAccountData = this.formatUpdateAccount(customer);

      const params = {
        ...existingAccountData,
        metadata: {
          ...existingAccountData.metadata,
          ...formatConsentsToRegisterFields(consents),
          consents: JSON.stringify(consents),
        },
      };

      const { data } = await InPlayer.Account.updateAccount(params);

      return {
        consents: this.parseJson(data?.metadata?.consents as string, []),
      };
    } catch {
      throw new Error('Unable to update Customer consents');
    }
  };

  updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...newAnswers }) => {
    return (await this.updateCustomer({ ...customer, ...newAnswers })) as ServiceResponse<Capture>;
  };

  changePasswordWithOldPassword: ChangePasswordWithOldPassword = async (payload) => {
    const { oldPassword, newPassword, newPasswordConfirmation } = payload;
    try {
      await InPlayer.Account.changePassword({
        oldPassword,
        password: newPassword,
        passwordConfirmation: newPasswordConfirmation,
      });
      return {
        errors: [],
        responseData: {},
      };
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
      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to reset password.');
    }
  };

  login: Login = async ({ config, email, password, referrer }) => {
    try {
      const { data } = await InPlayer.Account.signInV2({
        email,
        password,
        referrer,
        clientId: config.integrations.jwp?.clientId || '',
      });

      const user = this.formatAccount(data.account);
      user.externalData = await this.getCustomerExternalData();

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
      };
    } catch {
      throw new Error('Failed to authenticate user.');
    }
  };

  register: Register = async ({ config, email, password, referrer, consents }) => {
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
          ...formatConsentsToRegisterFields(consents),
          consents: JSON.stringify(consents),
        },
        type: 'consumer',
        clientId: config.integrations.jwp?.clientId || '',
      });

      const user = this.formatAccount(data.account);
      user.externalData = await this.getCustomerExternalData();

      return {
        auth: this.formatAuth(data),
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []),
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
      user.externalData = await this.getCustomerExternalData();

      return {
        user,
        customerConsents: this.parseJson(user?.metadata?.consents as string, []) as CustomerConsent[],
      };
    } catch {
      throw new Error('Failed to fetch user data.');
    }
  };

  updateCustomer: UpdateCustomer = async (customer) => {
    try {
      const response = await InPlayer.Account.updateAccount(this.formatUpdateAccount(customer));

      return {
        errors: [],
        responseData: this.formatAccount(response.data),
      };
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

  getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
    return {
      errors: [],
      responseData: {
        isCaptureEnabled: true,
        shouldCaptureBeDisplayed: true,
        settings: [
          {
            answer: {
              firstName: customer.firstName || null,
              lastName: customer.lastName || null,
            },
            enabled: true,
            key: 'firstNameLastName',
            required: true,
          },
        ],
      },
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
      return {
        errors: [],
        responseData: {},
      };
    } catch (error: unknown) {
      if (isCommonError(error)) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password.');
    }
  };

  getTermsConsent = ({ label: termsUrl }: RegisterField): Consent => {
    const termsLink = `<a href="${termsUrl || JW_TERMS_URL}" target="_blank">${i18next.t('account:registration.terms_and_conditions')}</a>`;

    // t('account:registration.terms_consent_jwplayer')
    // t('account:registration.terms_consent')
    return {
      type: 'checkbox',
      isCustomRegisterField: true,
      required: true,
      name: 'terms',
      label: termsUrl
        ? i18next.t('account:registration.terms_consent', { termsLink })
        : i18next.t('account:registration.terms_consent_jwplayer', { termsLink }),
      enabledByDefault: false,
      placeholder: '',
      options: {},
      version: '1',
    };
  };

  updatePersonalShelves: UpdatePersonalShelves = async (payload) => {
    const { favorites, history } = payload.externalData;
    const externalData = await this.getCustomerExternalData();
    const currentFavoriteIds = externalData?.favorites?.map((e) => e.mediaid);
    const payloadFavoriteIds = favorites?.map((e) => e.mediaid);
    const currentWatchHistoryIds = externalData?.history?.map((e) => e.mediaid);

    try {
      history?.forEach(async (history) => {
        if (
          !currentWatchHistoryIds?.includes(history.mediaid) ||
          externalData?.history?.some((e) => e.mediaid == history.mediaid && e.progress != history.progress)
        ) {
          await InPlayer.Account.updateWatchHistory(history.mediaid, history.progress);
        }
      });

      if (payloadFavoriteIds && payloadFavoriteIds.length > (currentFavoriteIds?.length || 0)) {
        payloadFavoriteIds.forEach(async (mediaId) => {
          if (!currentFavoriteIds?.includes(mediaId)) {
            await InPlayer.Account.addToFavorites(mediaId);
          }
        });
      } else {
        currentFavoriteIds?.forEach(async (mediaid) => {
          if (!payloadFavoriteIds?.includes(mediaid)) {
            await InPlayer.Account.deleteFromFavorites(mediaid);
          }
        });
      }

      return {
        errors: [],
        responseData: {},
      };
    } catch {
      throw new Error('Failed to update external data');
    }
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
      return getCommonResponseData(response);
    } catch {
      throw new Error('Failed to export account data');
    }
  };

  deleteAccount: DeleteAccount = async ({ password }) => {
    try {
      const response = await InPlayer.Account.deleteAccount({ password, brandingId: 0 });
      return getCommonResponseData(response);
    } catch {
      throw new Error('Failed to delete account');
    }
  };

  getSocialUrls: GetSocialURLs = async ({ config, redirectUrl }) => {
    const socialState = this.storageService.base64Encode(
      JSON.stringify({
        client_id: config.integrations.jwp?.clientId || '',
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
