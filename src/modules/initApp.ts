import AccountController from '#src/stores/AccountController';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import FavoritesController from '#src/stores/FavoritesController';
import { PersonalShelf } from '#src/config';
import { container } from '#src/modules/container';
import ApiService from '#src/services/api.service';
import ApiController from '#src/stores/ApiController';
import WatchHistoryService from '#src/services/WatchHistoryService';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import getIntegration, { IntegrationType } from '#src/utils/getIntegration';
import CleengService from '#src/services/integration/cleeng/CleengService';
import AccountService from '#src/services/integration/AccountService';
import CleengAccountService from '#src/services/integration/cleeng/CleengAccountService';
import CheckoutService from '#src/services/integration/CheckoutService';
import CleengCheckoutService from '#src/services/integration/cleeng/CleengCheckoutService';
import SubscriptionService from '#src/services/integration/SubscriptionService';
import CleengSubscriptionService from '#src/services/integration/cleeng/CleengSubscriptionService';
import InPlayerAccountService from '#src/services/integration/inplayer/InPlayerAccountService';
import InPlayerCheckoutService from '#src/services/integration/inplayer/InPlayerCheckoutService';
import SubscriptionJWService from '#src/services/integration/inplayer/InPlayerSubscriptionService';
import CheckoutController from '#src/stores/CheckoutController';
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/FavoritesService';
import EpgController from '#src/stores/EpgController';
import EntitlementController from '#src/stores/EntitlementController';
import ProfileService from '#src/services/integration/ProfileService';
import InPlayerProfileService from '#src/services/integration/inplayer/InPlayerProfileService';
import ProfileController from '#src/stores/ProfileController';

export const initApp = async (configSource: string | undefined) => {
  const config = await loadAndValidateConfig(configSource);
  const { integrationType } = getIntegration(config.integrations);

  container.unbindAll();

  // Common services
  container.bind(ApiService).toSelf();
  container.bind(EpgService).toSelf();

  // Common controllers
  container.bind(ApiController).toSelf();
  container.bind(EpgController).toSelf();

  if (integrationType === IntegrationType.CLEENG) {
    container.bind(CleengService).toSelf();
    container.bind(AccountService).to(CleengAccountService);
    container.bind(CheckoutService).to(CleengCheckoutService);
    container.bind(SubscriptionService).to(CleengSubscriptionService);
  }

  if (integrationType === IntegrationType.JWP) {
    container.bind(AccountService).to(InPlayerAccountService);
    container.bind(CheckoutService).to(InPlayerCheckoutService);
    container.bind(SubscriptionService).to(SubscriptionJWService);
    container.bind(ProfileService).to(InPlayerProfileService);
    container.bind(ProfileController).toSelf();
  }

  // We only request favorites and continue_watching data if there is a corresponding item in the content section
  // and a playlist in the features section.
  // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
  if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
    container.bind(WatchHistoryService).toSelf();
    container.bind(WatchHistoryController).toSelf();

    await container.resolve(WatchHistoryController).restoreWatchHistory();
  }

  if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
    container.bind(FavoritesService).toSelf();
    container.bind(FavoritesController).toSelf();

    await container.resolve(FavoritesController).initializeFavorites();
  }

  if (integrationType) {
    container.bind(AccountController).toSelf();
    container.bind(CheckoutController).toSelf();
    container.bind(EntitlementController).toSelf();
    container.bind(EntitlementService).toSelf();

    await container.resolve(AccountController).initializeAccount();
  }

  return config;
};
