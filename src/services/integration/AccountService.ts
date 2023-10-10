import type { Config } from '#types/Config';
import type {
  ChangePassword,
  GetCustomer,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  Register,
  ResetPassword,
  UpdateCustomer,
  UpdateCustomerConsents,
  GetCaptureStatus,
  UpdateCaptureAnswers,
  AuthData,
  SocialURLSData,
  GetLocales,
  ChangePasswordWithOldPassword,
  UpdatePersonalShelves,
  ExportAccountData,
  NotificationsData,
  DeleteAccount,
  Customer,
  CustomerConsent,
} from '#types/account';

interface AccountServiceFeatures {
  readonly canUpdateEmail: boolean;
  readonly canSupportEmptyFullName: boolean;
  readonly canChangePasswordWithOldPassword: boolean;
  readonly canRenewSubscription: boolean;
  readonly canExportAccountData: boolean;
  readonly canDeleteAccount: boolean;
  readonly canUpdatePaymentMethod: boolean;
  readonly canShowReceipts: boolean;
}

export const AccountServiceFactoryId = Symbol('AccountServiceFactory');

export type AccountServiceFactory = (integration: string | undefined) => AccountService | undefined;

export default abstract class AccountService {
  readonly features: AccountServiceFeatures;

  protected constructor(features: AccountServiceFeatures) {
    this.features = features;
  }

  abstract initialize: (config: Config, logoutCallback: () => Promise<void>) => Promise<void>;

  abstract getAuthData: () => Promise<AuthData | null>;

  abstract login: Login;

  abstract register: Register;

  abstract logout: () => Promise<void>;

  abstract getUser: ({ config }: { config: Config }) => Promise<{
    user: Customer;
    customerConsents: CustomerConsent[];
  }>;

  abstract getPublisherConsents: GetPublisherConsents;

  abstract getCustomerConsents: GetCustomerConsents;

  abstract updateCustomerConsents: UpdateCustomerConsents;

  abstract getCaptureStatus: GetCaptureStatus;

  abstract updateCaptureAnswers: UpdateCaptureAnswers;

  abstract resetPassword: ResetPassword;

  abstract changePasswordWithResetToken: ChangePassword;

  abstract changePasswordWithOldPassword: ChangePasswordWithOldPassword;

  abstract updateCustomer: UpdateCustomer;

  abstract updatePersonalShelves: UpdatePersonalShelves;

  abstract subscribeToNotifications: NotificationsData;

  abstract exportAccountData: ExportAccountData;

  abstract getSocialUrls: SocialURLSData;

  abstract deleteAccount: DeleteAccount;

  abstract getLocales: GetLocales;

  abstract getCustomer: GetCustomer;
}
