import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import InfiniteScroll from 'react-infinite-scroller';
import { useQueries, useQueryClient } from 'react-query';
import type { Content } from '@jwp/ott-common/types/config';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useWatchHistoryStore, useWatchHistoryStore as WatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useFavoritesStore as FavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { slugify } from '@jwp/ott-common/src/utils/urlFormatting';
import { generatePlaylistPlaceholder, parseAspectRatio, parseTilesDelta } from '@jwp/ott-common/src/utils/collection';
import { isTruthyCustomParamValue, testId } from '@jwp/ott-common/src/utils/common';
import { PersonalShelf, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import { getModule } from '@jwp/ott-common/src/modules/container';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { isScheduledOrLiveMedia } from '@jwp/ott-common/src/utils/liveEvent';

import ShelfComponent from '../../components/Shelf/Shelf';
import InfiniteScrollLoader from '../../components/InfiniteScrollLoader/InfiniteScrollLoader';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

import styles from './ShelfList.module.scss';

const INITIAL_ROWS_LOADED = 6;
const LOAD_ROWS_COUNT = 4;

type Props = {
  rows: Content[];
};

const placeholderData = generatePlaylistPlaceholder(30);

const ShelfList = ({ rows }: Props) => {
  const { accessModel } = useConfigStore(({ accessModel }) => ({ accessModel }), shallow);
  const [rowsLoaded, setRowsLoaded] = useState(INITIAL_ROWS_LOADED);
  const { t } = useTranslation('error');

  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionaryWithSeries());

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  // Todo: move to more common package?
  const page_limit = PLAYLIST_LIMIT.toString();
  const queryClient = useQueryClient();
  const apiService = getModule(ApiService);
  const playlists = useQueries(
    rows.map(({ contentId, type }, index) => ({
      enabled: !!contentId && rowsLoaded > index,
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

  useEffect(() => {
    // reset row count when the page changes
    return () => setRowsLoaded(INITIAL_ROWS_LOADED);
  }, [rows]);

  // If all playlists are empty, due to geo restrictions, we show a geo block error page
  const allPlaylistsEmpty = playlists.every(({ data, isSuccess }) => isSuccess && !data?.playlist?.length);

  if (allPlaylistsEmpty) {
    return <ErrorPage title={t('geo_blocked_heading')} message={t('geo_blocked_description')} />;
  }

  return (
    <div className={styles.shelfList}>
      <InfiniteScroll
        style={{ overflow: 'hidden' }}
        loadMore={() => setRowsLoaded((current) => current + LOAD_ROWS_COUNT)}
        hasMore={rowsLoaded < rows.length}
        role="grid"
        loader={<InfiniteScrollLoader key="loader" />}
      >
        {rows.slice(0, rowsLoaded - 1).map(({ type, featured, title }, index) => {
          const { data: playlist, isLoading, error } = playlists[index];

          if (!playlist?.playlist?.length) return null;

          const posterAspect = parseAspectRatio(playlist.cardImageAspectRatio || playlist.shelfImageAspectRatio);
          const visibleTilesDelta = parseTilesDelta(posterAspect);

          return (
            <div
              key={`${index}_${playlist.id}`}
              role="row"
              className={classNames(styles.shelfContainer, { [styles.featured]: featured })}
              data-testid={testId(`shelf-${featured ? 'featured' : type === 'playlist' ? slugify(title || playlist?.title) : type}`)}
            >
              <div role="cell">
                <ShelfComponent
                  loading={isLoading}
                  error={error}
                  type={type}
                  playlist={playlist}
                  watchHistory={type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                  title={title || playlist?.title}
                  featured={featured}
                  accessModel={accessModel}
                  isLoggedIn={!!user}
                  hasSubscription={!!subscription}
                  posterAspect={posterAspect}
                  visibleTilesDelta={visibleTilesDelta}
                />
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default ShelfList;
