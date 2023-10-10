import { injectable, inject } from 'inversify';

import ConfigService from '#src/services/ConfigService';
import { calculateContrastColor } from '#src/utils/common';
import type { Config, Styling } from '#types/Config';
import { addScript } from '#src/utils/dom';
import SettingsService from '#src/services/SettingsService';
import { getConfigSource } from '#src/utils/configOverride';

@injectable()
export default class ApplicationService {
  constructor(@inject(ConfigService) private configService: ConfigService, @inject(SettingsService) private settingsService: SettingsService) {}

  // init
  async init() {
    const settings = await this.settingsService.getSettings();
    const searchParams = new URLSearchParams(window.location.search);
    const configSource = getConfigSource(searchParams, settings);
    const config = await this.configService.getConfig(configSource);

    this.#applyStyling(config);
    this.#injectLibaries(config);

    return {
      settings,
      configSource,
      config,
    }
  }

  #applyStyling(config: Config) {
    setCssVariables(config.styling || {});
  }

  #injectLibaries(config: Config) {
    maybeInjectAnalyticsLibrary(config);
  }
}

const maybeInjectAnalyticsLibrary = (config: Config) => {
  if (!config.analyticsToken) return;

  return addScript('/jwpltx.js');
};

export const setCssVariables = ({ backgroundColor, highlightColor, headerBackground }: Styling) => {
  const root = document.querySelector(':root') as HTMLElement;

  if (root && backgroundColor) {
    root.style.setProperty('--body-background-color', backgroundColor);
    root.style.setProperty('--background-contrast-color', calculateContrastColor(backgroundColor));
  }

  if (root && highlightColor) {
    root.style.setProperty('--highlight-color', highlightColor);
    root.style.setProperty('--highlight-contrast-color', calculateContrastColor(highlightColor));
  }
  if (root && headerBackground) {
    root.style.setProperty('--header-background', headerBackground);
    root.style.setProperty('--header-contrast-color', calculateContrastColor(headerBackground));
  }
};
