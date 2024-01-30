import i18next from 'i18next';
import { injectable } from 'inversify';

import FavoriteService from '../services/FavoriteService';
import type { PlaylistItem } from '../../types/playlist';
import { logDev } from '../utils/common';

import { useAccountStore } from './AccountStore';
import { useFavoritesStore } from './FavoritesStore';
import { useConfigStore } from './ConfigStore';

@injectable()
export default class FavoritesController {
  private readonly favoritesService: FavoriteService;

  constructor(favoritesService: FavoriteService) {
    this.favoritesService = favoritesService;

    // restore watch history when the user changes
    useAccountStore.subscribe((state, previousState) => {
      const isLoggedIn = !!state.user && !previousState.user;
      const isLoggedOut = !state.user && !!previousState.user;

      if (isLoggedIn || isLoggedOut) {
        this.restoreFavorites().catch(logDev);
      }
    });
  }

  initialize = async () => {
    await this.restoreFavorites();
  };

  restoreFavorites = async () => {
    const { user } = useAccountStore.getState();
    const favoritesList = useConfigStore.getState().config.features?.favoritesList;

    if (!favoritesList) {
      return;
    }

    const favorites = await this.favoritesService.getFavorites(user, favoritesList);

    useFavoritesStore.setState({ favorites, favoritesPlaylistId: favoritesList });
  };

  persistFavorites = async () => {
    const { favorites } = useFavoritesStore.getState();
    const { user } = useAccountStore.getState();

    await this.favoritesService.persistFavorites(user, favorites);
  };

  saveItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
      const items = [this.favoritesService.createFavorite(item)].concat(favorites);
      useFavoritesStore.setState({ favorites: items });
      await this.persistFavorites();
    }
  };

  removeItem = async (item: PlaylistItem) => {
    const { favorites } = useFavoritesStore.getState();

    const items = favorites.filter(({ mediaid }) => mediaid !== item.mediaid);
    useFavoritesStore.setState({ favorites: items });

    await this.persistFavorites();
  };

  toggleFavorite = async (item: PlaylistItem | undefined) => {
    const { favorites, hasItem, setWarning } = useFavoritesStore.getState();

    if (!item) {
      return;
    }

    const isFavorite = hasItem(item);

    if (isFavorite) {
      await this.removeItem(item);

      return;
    }

    // If we exceed the max available number of favorites, we show a warning
    if (this.favoritesService.hasReachedFavoritesLimit(favorites)) {
      setWarning(i18next.t('video:favorites_warning', { maxCount: this.favoritesService.getMaxFavoritesCount() }));
      return;
    }

    await this.saveItem(item);
  };

  clear = async () => {
    useFavoritesStore.setState({ favorites: [] });

    await this.persistFavorites();
  };
}
