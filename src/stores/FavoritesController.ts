import i18next from 'i18next';
import { injectable, inject } from 'inversify';

import { useAccountStore } from '#src/stores/AccountStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import FavoritesService from '#src/services/FavoritesService';
import type { PlaylistItem } from '#types/playlist';
import type { Favorite, SerializedFavorite } from '#types/favorite';
import type { Customer } from '#types/account';
import AccountService from '#src/services/integration/AccountService';

@injectable()
export default class FavoritesController {
  private readonly favoritesService: FavoritesService;
  private readonly accountService?: AccountService;

  constructor(favoritesService: FavoritesService, @inject(AccountService) accountService: AccountService) {
    this.favoritesService = favoritesService;
    this.accountService = accountService;
  }

  async restoreFavorites() {
    const { user } = useAccountStore.getState();
    const favoritesList = useConfigStore.getState().config.features?.favoritesList;

    if (!favoritesList) {
      return;
    }
    const favorites = await this.favoritesService.getFavorites(user, favoritesList);

    if (!favorites) {
      return;
    }

    useFavoritesStore.setState({ favorites, favoritesPlaylistId: favoritesList });
  }

  persistFavorites = () => {
    const { favorites } = useFavoritesStore.getState();
    const { user } = useAccountStore.getState();
    const { getSandbox } = useConfigStore.getState();

    if (user?.id && user?.externalData) {
      return this.accountService?.updatePersonalShelves({ id: user.id, externalData: user.externalData }, getSandbox());
    }

    this.favoritesService.persistFavorites(favorites);
  };

  serializeFavorites = (favorites: Favorite[]): SerializedFavorite[] => {
    return this.favoritesService.serializeFavorites(favorites);
  };

  private updateUserFavorites(favorites: Favorite[]) {
    useAccountStore.setState((state) => ({
      ...state,
      user: {
        ...(state.user as Customer),
        externalData: { ...state.user?.externalData, favorites: this.serializeFavorites(favorites) },
      },
    }));
  }

  async initializeFavorites() {
    await this.restoreFavorites();
  }

  async saveItem(item: PlaylistItem) {
    const { favorites } = useFavoritesStore.getState();
    const service = this.favoritesService;

    if (!favorites.some(({ mediaid }) => mediaid === item.mediaid)) {
      const items = [service.createFavorite(item)].concat(favorites);
      useFavoritesStore.setState({ favorites: items });
      this.updateUserFavorites(items);
      await this.persistFavorites();
    }
  }

  async removeItem(item: PlaylistItem) {
    const { favorites } = useFavoritesStore.getState();

    const items = favorites.filter(({ mediaid }) => mediaid !== item.mediaid);
    useFavoritesStore.setState({ favorites: items });
    this.updateUserFavorites(items);

    await this.persistFavorites();
  }

  async toggleFavorite(item: PlaylistItem | undefined) {
    const { favorites, hasItem, setWarning } = useFavoritesStore.getState();

    if (!item) {
      return;
    }

    const isFavorited = hasItem(item);

    if (isFavorited) {
      await this.removeItem(item);

      return;
    }

    // If we exceed the max available number of favorites, we show a warning
    if (this.favoritesService.hasReachedFavoritesLimit(favorites)) {
      setWarning(i18next.t('video:favorites_warning', { maxCount: this.favoritesService.getMaxFavoritesCount() }));
      return;
    }

    await this.saveItem(item);
  }

  async clear() {
    useFavoritesStore.setState({ favorites: [] });

    await this.persistFavorites();
  }
}
