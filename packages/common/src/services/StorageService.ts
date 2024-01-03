export default abstract class StorageService {
  abstract initialize(prefix: string): void;

  abstract getItem<T>(key: string, parse: boolean): Promise<T | null>;

  abstract setItem(key: string, value: string, usePrefix?: boolean): Promise<void>;

  abstract removeItem(key: string): Promise<void>;
}
