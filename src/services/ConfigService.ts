import { injectable } from 'inversify';
import i18next from 'i18next';

import type { Config, AccessModel } from '#types/Config';
import { configSchema } from '#src/utils/configSchema';

const CONFIG_HOST = import.meta.env.APP_API_BASE_URL;

@injectable()
export default class ConfigService {
  config: Config | null = null;

  async getConfig(configSource: string | undefined) {
    this.config = configSchema.getDefault() as Config;

    if (!configSource) {
      throw new Error('Config not defined');
    }

    this.config = await this.#fetchConfig(configSource);
    this.config = await this.#validateSchema(this.config);

    this.config.id = configSource;

    return this.config;
  }

  getAccessModel() {
    return this.config ? calculateAccessModel(this.config) : 'AVOD';
  }

  async #fetchConfig(configSource: string) {
    const configLocation = formatSourceLocation(configSource);

    if (!configLocation) {
      throw new Error('No config location found');
    }

    const response = await fetch(configLocation, {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to load the config. Please check the config path and the file availability.');
    }

    const data = await response.json();

    if (!data) {
      throw new Error('No config found');
    }

    return this.#enrichConfig(data);
  }

  #enrichConfig = (config: Config): Config => {
    const { content, siteName } = config;
    const updatedContent = content.map((content) => Object.assign({ featured: false }, content));

    return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
  };

  #validateSchema(config: Config) {
    return configSchema.validate(config, {
      strict: true,
    }) as Promise<Config>;
  }
}

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `${CONFIG_HOST}/apps/configs/${source}.json`;
  }

  return source;
}

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};

const calculateAccessModel = (config: Config): AccessModel => {
  if (config?.integrations?.cleeng?.id) {
    return config?.integrations?.cleeng?.monthlyOffer || config?.integrations?.cleeng?.yearlyOffer ? 'SVOD' : 'AUTHVOD';
  }

  if (config?.integrations?.jwp?.clientId) {
    return config?.integrations?.jwp?.assetId ? 'SVOD' : 'AUTHVOD';
  }

  return 'AVOD';
};
