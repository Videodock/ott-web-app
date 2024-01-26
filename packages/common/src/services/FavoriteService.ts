import { injectable } from 'inversify';
import { object, array, string } from 'yup';

import { MAX_WATCHLIST_ITEMS_COUNT } from '../constants';
import type { Favorite, SerializedFavorite } from '../../types/favorite';
import type { PlaylistItem } from '../../types/playlist';
import type { Customer } from '../../types/account';

import ApiService from './ApiService';
import StorageService from './StorageService';

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

  constructor(apiService: ApiService, storageService: StorageService) {
    this.apiService = apiService;
    this.storageService = storageService;
  }

  private validateFavorites(user: Customer) {
    if (schema.validateSync(user.metadata?.favorites)) {
      return user.metadata.favorites as SerializedFavorite[];
    }

    return [];
  }

  getFavorites = async (user: Customer | null, favoritesList: string) => {
    const savedItems = user ? this.validateFavorites(user) : await this.storageService.getItem<Favorite[]>(this.PERSIST_KEY_FAVORITES, true);

    if (savedItems?.length) {
      const playlistItems = await this.apiService.getMediaByWatchlist(
        favoritesList,
        savedItems.map(({ mediaid }) => mediaid),
      );

      return (playlistItems || []).map((item) => this.createFavorite(item));
    }
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return favorites.map(({ mediaid }) => ({ mediaid }));
  };

  persistFavorites = (favorites: Favorite[]) => {
    this.storageService.setItem(this.PERSIST_KEY_FAVORITES, JSON.stringify(this.serializeFavorites(favorites)));
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
