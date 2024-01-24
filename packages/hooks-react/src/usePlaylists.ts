import { PersonalShelf, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import { getModule } from '@jwp/ott-common/src/modules/container';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { useFavoritesStore as FavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { useWatchHistoryStore as WatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { generatePlaylistPlaceholder } from '@jwp/ott-common/src/utils/collection';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import { isScheduledOrLiveMedia } from '@jwp/ott-common/src/utils/liveEvent';
import type { Content } from '@jwp/ott-common/types/config';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useQueries, useQueryClient } from 'react-query';

const placeholderData = generatePlaylistPlaceholder(30);

const usePlaylist = (content: Content[], rowsToLoad: number | undefined = undefined) => {
  const page_limit = PLAYLIST_LIMIT.toString();
  const queryClient = useQueryClient();
  const apiService = getModule(ApiService);

  return useQueries(
    content.map(({ contentId, type }, index) => ({
      enabled: !!contentId && (!rowsToLoad || rowsToLoad > index),
      queryKey: ['playlist', contentId],
      queryFn: async () => {
        if (type === PersonalShelf.Favorites) return FavoritesStore.getState().getPlaylist();
        if (type === PersonalShelf.ContinueWatching) return WatchHistoryStore.getState().getPlaylist();

        const playlist = await apiService.getPlaylistById(contentId, { page_limit });

        // This pre-caches all playlist items and makes navigating a lot faster.
        playlist?.playlist?.forEach((playlistItem) => {
          queryClient.setQueryData(['media', playlistItem.mediaid], playlistItem);
        });

        return playlist;
      },
      placeholderData: !!contentId && placeholderData,
      refetchInterval: (data: Playlist | undefined) => {
        if (!data) return false;

        const autoRefetch = isTruthyCustomParamValue(data.refetch) || data.playlist.some(isScheduledOrLiveMedia);

        return autoRefetch ? 1000 * 30 : false;
      },
      retry: false,
    })),
  );
};

export default usePlaylist;
