import { injectable } from '@jwp/ott-common/src/modules/container';
import StorageService from '@jwp/ott-common/src/services/StorageService';

@injectable()
export class LocalStorageService extends StorageService {
  prefix: string = 'jwapp';

  initialize(prefix: string) {
    this.prefix = prefix;
  }

  getStorageKey(key: string) {
    return `${this.prefix}.${key}`;
  }

  async getItem(key: string, parse: boolean) {
    try {
      const value = window.localStorage.getItem(this.getStorageKey(key));

      return value && parse ? JSON.parse(value) : value;
    } catch (error: unknown) {
      console.error(error);
    }
  }

  async setItem(key: string, value: string, usePrefix = true) {
    try {
      window.localStorage.setItem(usePrefix ? this.getStorageKey(key) : key, value);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  async removeItem(key: string) {
    try {
      window.localStorage.removeItem(this.getStorageKey(key));
    } catch (error: unknown) {
      console.error(error);
    }
  }
}
