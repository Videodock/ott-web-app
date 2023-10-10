import { injectable, inject } from 'inversify';

import ApplicationService from '#src/services/ApplicationService';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useSettingsStore } from '#src/stores/SettingsStore';

@injectable()
export default class ApplicationController {
  constructor(@inject(ApplicationService) private applicationService: ApplicationService) {}

  async bootstrap() {
    const { settings, config } = await this.applicationService.init();

    useConfigStore.setState({
      config,
    });

    useSettingsStore.setState(settings);
  }
}
