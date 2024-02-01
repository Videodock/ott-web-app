import type { AccessModel, Config } from '../../../types/config';
import type {
  ChangePassword,
  ChangePasswordWithOldPassword,
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
  UpdateConsentsValues,
  Logout,
  GetAuthData,
  UpdateCustomer,
  UpdateWatchHistory,
  UpdateFavorites,
  GetWatchHistory,
  GetFavorites,
  GetUser,
} from '../../../types/account';

export type AccountServiceFeatures = {
  readonly canUpdateEmail: boolean;
  readonly canSupportEmptyFullName: boolean;
  readonly canChangePasswordWithOldPassword: boolean;
  readonly canRenewSubscription: boolean;
  readonly canExportAccountData: boolean;
  readonly canDeleteAccount: boolean;
  readonly canUpdatePaymentMethod: boolean;
  readonly canShowReceipts: boolean;
  readonly hasSocialURLs: boolean;
  readonly hasNotifications: boolean;
};

export default abstract class AccountService {
  readonly features: AccountServiceFeatures;

  abstract accessModel: AccessModel;
  abstract svodOfferIds: string[];
  abstract sandbox: boolean;

  protected constructor(features: AccountServiceFeatures) {
    this.features = features;
  }

  abstract initialize: (config: Config, url: string, logoutCallback: () => Promise<void>) => Promise<void>;

  abstract getAuthData: GetAuthData;

  abstract login: Login;

  abstract register: Register;

  abstract logout: Logout;

  abstract getUser: GetUser;

  abstract getConsents: GetConsents;

  abstract getConsentsValues: GetConsentsValues;

  abstract updateConsentsValues: UpdateConsentsValues;

  abstract getRegistrationFields: GetRegistrationFields;

  abstract updateRegistrationFieldsValues: UpdateRegistrationFieldsValues;

  abstract resetPassword: ResetPassword;

  abstract changePasswordWithResetToken: ChangePassword;

  abstract changePasswordWithOldPassword: ChangePasswordWithOldPassword;

  abstract updateCustomer: UpdateCustomer;

  abstract updateWatchHistory: UpdateWatchHistory;

  abstract updateFavorites: UpdateFavorites;

  abstract getWatchHistory: GetWatchHistory;

  abstract getFavorites: GetFavorites;

  abstract subscribeToNotifications: NotificationsData;

  abstract getSocialUrls?: GetSocialURLs;

  abstract exportAccountData?: ExportAccountData;

  abstract deleteAccount?: DeleteAccount;
}
