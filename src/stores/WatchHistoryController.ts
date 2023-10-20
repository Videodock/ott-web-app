import { inject, injectable, optional } from 'inversify';

import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import WatchHistoryService from '#src/services/WatchHistoryService';
import type { Customer } from '#types/account';
import type AccountService from '#src/services/integration/AccountService';

@injectable()
export default class WatchHistoryController {
  private readonly watchHistoryService: WatchHistoryService;
  private readonly accountService?: AccountService;

  constructor(
    @inject(WatchHistoryService) watchHistoryService: WatchHistoryService,
    @inject(WatchHistoryService) @optional() accountService?: AccountService) {
    this.watchHistoryService = watchHistoryService;
    this.accountService = accountService;
  }

  serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] => {
    return this.watchHistoryService.serializeWatchHistory(watchHistory);
  };

  async initializeWatchHistory() {
    await this.restoreWatchHistory();
  }

  private updateUserWatchHistory(watchHistory: WatchHistoryItem[]) {
    useAccountStore.setState((state) => ({
      ...state,
      user: {
        ...(state.user as Customer),
        externalData: { ...state.user?.externalData, history: this.serializeWatchHistory(watchHistory) },
      },
    }));
  }

  async restoreWatchHistory() {
    const { user } = useAccountStore.getState();
    const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;

    if (!continueWatchingList) {
      return;
    }

    const watchHistory = await this.watchHistoryService.getWatchHistory(user, continueWatchingList);

    if (watchHistory?.length) {
      useWatchHistoryStore.setState({
        watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
        playlistItemsLoaded: true,
        continueWatchingPlaylistId: continueWatchingList,
      });
    }
  }

  async persistWatchHistory() {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { user } = useAccountStore.getState();
    const { getSandbox } = useConfigStore.getState();

    if (user?.id && user?.externalData && this.accountService) {
      return this.accountService.updatePersonalShelves({ id: user.id, externalData: user.externalData }, getSandbox());
    }

    this.watchHistoryService.persistWatchHistory(watchHistory);
  }

  /**
   *  If we already have an element with continue watching state, we:
   *    1. Update the progress
   *    2. Move the element to the continue watching list start
   *  Otherwise:
   *    1. Move the element to the continue watching list start
   *    2. If there are many elements in continue watching state we remove the oldest one
   */
  async saveItem(item: PlaylistItem, seriesItem: PlaylistItem | undefined, videoProgress: number | null) {
    const { watchHistory } = useWatchHistoryStore.getState();

    if (!videoProgress) return;

    const updatedHistory = await this.watchHistoryService.saveItem(item, seriesItem, videoProgress, watchHistory);

    if (updatedHistory) {
      useWatchHistoryStore.setState({ watchHistory: updatedHistory });
      this.updateUserWatchHistory(updatedHistory);
      await this.persistWatchHistory();
    }
  }
}
