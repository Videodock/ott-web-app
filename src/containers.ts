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
import AccountService, {
  AccountServiceFactoryId
} from '#src/services/integration/AccountService';
import CleengAccountService from '#src/services/integration/cleeng/CleengAccountService';
import InPlayerAccountService from '#src/services/integration/inplayer/InPlayerAccountService';
import CheckoutService, { CheckoutServiceFactoryId } from '#src/services/integration/CheckoutService';
import CleengCheckoutService from '#src/services/integration/cleeng/CleengCheckoutService';
import InPlayerSubscriptionService from '#src/services/integration/inplayer/InPlayerSubscriptionService';
import InPlayerCheckoutService from '#src/services/integration/inplayer/InPlayerCheckoutService';
import CleengService from '#src/services/integration/cleeng/CleengService';
import SubscriptionService, { SubscriptionServiceFactoryId } from '#src/services/integration/SubscriptionService';
import CleengSubscriptionService from '#src/services/integration/cleeng/CleengSubscriptionService';
import FavoritesController from '#src/stores/FavoritesController';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import FavoritesService from '#src/services/FavoritesService';
import WatchHistoryService from '#src/services/WatchHistoryService';

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
container.bind(AccountService).to(CleengAccountService).whenTargetNamed('cleeng');
container.bind<CheckoutService>('CheckoutService').to(CleengCheckoutService).whenTargetNamed('cleeng');
container.bind(SubscriptionService).to(CleengSubscriptionService).whenTargetNamed('cleeng');

// InPlayer
container.bind(AccountService).to(InPlayerAccountService).whenTargetNamed('inplayer');
container.bind<CheckoutService>('CheckoutService').to(InPlayerCheckoutService).whenTargetNamed('inplayer');
container.bind(SubscriptionService).to(InPlayerSubscriptionService).whenTargetNamed('inplayer');

// Factories
container.bind(AccountServiceFactoryId).toFactory((context) => {
  return (integration: string) => integration ? context.container.getNamed<AccountService>(AccountService, integration) : undefined;
});

container.bind(CheckoutServiceFactoryId).toFactory((context) => {
  return (integration: string) => integration ? context.container.getNamed<CheckoutService>('CheckoutService', integration) : undefined;
});

container.bind(SubscriptionServiceFactoryId).toFactory((context) => {
  return (integration: string) => integration ? context.container.getNamed<SubscriptionService>(SubscriptionService, integration) : undefined;
});
