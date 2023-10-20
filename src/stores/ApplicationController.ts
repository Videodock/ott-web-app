import { injectable, inject } from 'inversify';

import ApplicationService from '#src/services/ApplicationService';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useSettingsStore } from '#src/stores/SettingsStore';
import { getModule } from '#src/modules/container';
import AccountController from '#src/stores/AccountController';
import FavoritesController from '#src/stores/FavoritesController';
import WatchHistoryController from '#src/stores/WatchHistoryController';

@injectable()
export default class ApplicationController {
  private isLoaded = false;

  constructor (@inject(ApplicationService) private applicationService: ApplicationService) {}

  async bootstrap () {
    const { settings, config } = await this.applicationService.init();

    useConfigStore.setState({
      config,
    });

    useSettingsStore.setState(settings);

    this.isLoaded = true;

    // ignore promise
    this.initializeControllers();
  }

  async initializeControllers() {
    await getModule(AccountController).initializeAccount();

    await Promise.all([
      getModule(FavoritesController).initializeFavorites(),
      getModule(WatchHistoryController).initializeWatchHistory(),
    ]);
  }

  isReady() {
    return this.isLoaded;
  }

  getAuthProviderName () {
    const { cleeng, jwp } = useConfigStore.getState().config.integrations;

    if (jwp?.clientId) return 'inplayer';

    if (cleeng?.id) return 'cleeng';
  }
}
