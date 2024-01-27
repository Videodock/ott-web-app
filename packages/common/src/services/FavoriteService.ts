import { inject, injectable } from 'inversify';
import { object, array, string } from 'yup';

import { MAX_WATCHLIST_ITEMS_COUNT } from '../constants';
import type { Favorite, SerializedFavorite } from '../../types/favorite';
import type { PlaylistItem } from '../../types/playlist';
import type { Customer } from '../../types/account';
import { getNamedModule } from '../modules/container';
import { INTEGRATION_TYPE } from '../modules/types';

import ApiService from './ApiService';
import StorageService from './StorageService';
import AccountService from './integrations/AccountService';

const schema = array(
  object().shape({
    mediaid: string(),
  }),
);

@injectable()
export default class FavoriteService {
  private MAX_FAVORITES_COUNT = 48;
  private PERSIST_KEY_FAVORITES = 'favorites';

  private readonly apiService;
  private readonly storageService;
  private readonly accountService;

  constructor(@inject(INTEGRATION_TYPE) integrationType: string, apiService: ApiService, storageService: StorageService) {
    this.apiService = apiService;
    this.storageService = storageService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  private validateFavorites(favorites: unknown) {
    if (schema.validateSync(favorites)) {
      return favorites as SerializedFavorite[];
    }

    return [];
  }

  private async getFavoritesFromAccount(user: Customer) {
    const favorites = await this.accountService?.getFavorites({ id: user.id });

    return this.validateFavorites(favorites);
  }

  private async getFavoritesFromStorage() {
    const favorites = await this.storageService.getItem(this.PERSIST_KEY_FAVORITES, true);

    return this.validateFavorites(favorites);
  }

  getFavorites = async (user: Customer | null, favoritesList: string) => {
    const savedItems = user ? await this.getFavoritesFromAccount(user) : await this.getFavoritesFromStorage();

    const playlistItems = await this.apiService.getMediaByWatchlist(
      favoritesList,
      savedItems.map(({ mediaid }) => mediaid),
    );

    return (playlistItems || []).map((item) => this.createFavorite(item));
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return favorites.map(({ mediaid }) => ({ mediaid }));
  };

  persistFavorites = async (user: Customer | null, favorites: Favorite[]) => {
    if (user?.id) {
      return this.accountService?.updateFavorites({
        id: user.id,
        favorites: this.serializeFavorites(favorites),
      });
    } else {
      await this.storageService.setItem(this.PERSIST_KEY_FAVORITES, JSON.stringify(this.serializeFavorites(favorites)));
    }
  };

  getMaxFavoritesCount = () => {
    return this.MAX_FAVORITES_COUNT;
  };

  hasReachedFavoritesLimit = (favorites: Favorite[]) => {
    return favorites?.length >= MAX_WATCHLIST_ITEMS_COUNT;
  };

  createFavorite = (item: PlaylistItem): Favorite => {
    return {
      mediaid: item.mediaid,
      title: item.title,
      tags: item.tags,
      duration: item.duration,
      playlistItem: item,
    } as Favorite;
  };
}
