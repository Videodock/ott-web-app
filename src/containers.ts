import { container } from '#src/modules/container';
import ApiService from '#src/services/api.service';
import EpgService from '#src/services/epg.service';
import ApiController from '#src/stores/ApiController';
import EpgController from '#src/stores/EpgController';
import ApplicationService from '#src/services/ApplicationService';
import ConfigService from '#src/services/ConfigService';
import SettingsService from '#src/services/SettingsService';
import ApplicationController from '#src/stores/ApplicationController';
import AccountController from '#src/stores/AccountController';
import CheckoutController from '#src/stores/CheckoutController';
import EntitlementController from '#src/stores/EntitlementController';
import AccountService from '#src/services/integration/AccountService';
import CleengAccountService from '#src/services/integration/cleeng/CleengAccountService';
import InPlayerAccountService from '#src/services/integration/inplayer/InPlayerAccountService';
import CheckoutService from '#src/services/integration/CheckoutService';
import CleengCheckoutService from '#src/services/integration/cleeng/CleengCheckoutService';
import InPlayerSubscriptionService from '#src/services/integration/inplayer/InPlayerSubscriptionService';
import InPlayerCheckoutService from '#src/services/integration/inplayer/InPlayerCheckoutService';
import CleengService from '#src/services/integration/cleeng/CleengService';
import SubscriptionService from '#src/services/integration/SubscriptionService';
import CleengSubscriptionService from '#src/services/integration/cleeng/CleengSubscriptionService';
import FavoritesController from '#src/stores/FavoritesController';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import FavoritesService from '#src/services/FavoritesService';
import WatchHistoryService from '#src/services/WatchHistoryService';

// live reload purposes
container.unbindAll();

// Common services
container.bind(ApplicationService).toSelf();
container.bind(ConfigService).toSelf();
container.bind(ApiService).toSelf();
container.bind(EpgService).toSelf();
container.bind(SettingsService).toSelf();
container.bind(FavoritesService).toSelf();
container.bind(WatchHistoryService).toSelf();

// Common controllers
container.bind(ApplicationController).toSelf();
container.bind(ApiController).toSelf();
container.bind(EpgController).toSelf();
container.bind(EntitlementController).toSelf();
container.bind(FavoritesController).toSelf();
container.bind(WatchHistoryController).toSelf();

// Integrations
container.bind(AccountController).toSelf().inSingletonScope();
container.bind(CheckoutController).toSelf().inSingletonScope();

// Cleeng
container.bind(CleengService).toSelf();
container.bind(CleengAccountService).toSelf();
container.bind(CleengCheckoutService).toSelf();
container.bind(CleengSubscriptionService).toSelf();

// InPlayer
container.bind(InPlayerAccountService).toSelf();
container.bind(InPlayerCheckoutService).toSelf();
container.bind(InPlayerSubscriptionService).toSelf();

container.bind<AccountService | undefined>(AccountService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(ApplicationController);
  const authProviderName = applicationController.getAuthProviderName();

  if (!applicationController.isReady()) throw new Error('Requested the AccountService before the config has been loaded');
  if (authProviderName === 'inplayer') return container.resolve(InPlayerAccountService);
  if (authProviderName === 'cleeng') return container.resolve(CleengAccountService);
});

// @ts-ignore
container.bind<CheckoutService | undefined>(CheckoutService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(ApplicationController);
  const authProviderName = applicationController.getAuthProviderName();

  if (!applicationController.isReady()) throw new Error('Requested the CheckoutService before the config has been loaded');
  if (authProviderName === 'inplayer') return container.resolve(InPlayerCheckoutService);
  if (authProviderName === 'cleeng') return container.resolve(CleengCheckoutService);
});

container.bind<SubscriptionService | undefined>(SubscriptionService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(ApplicationController);
  const authProviderName = applicationController.getAuthProviderName();

  if (!applicationController.isReady()) throw new Error('Requested the SubscriptionService before the config has been loaded');
  if (authProviderName === 'inplayer') return container.resolve(InPlayerSubscriptionService);
  if (authProviderName === 'cleeng') return container.resolve(CleengSubscriptionService);
});

