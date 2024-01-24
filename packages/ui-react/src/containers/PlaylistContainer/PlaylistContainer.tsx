import React, { useEffect } from 'react';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { ContentType } from '@jwp/ott-common/types/config';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { PersonalShelf, PersonalShelves, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import usePlaylist from '@jwp/ott-hooks-react/src/usePlaylist';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
  style?: React.CSSProperties;
};

type Props = {
  playlistId?: string;
  type: ContentType;
  relatedItem?: PlaylistItem;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  style?: React.CSSProperties;
  showEmpty?: boolean;
};

const PlaylistContainer = ({ playlistId, type, onPlaylistUpdate, style, children, showEmpty = false }: Props): JSX.Element | null => {
  const isPersonalShelf = PersonalShelves.some((shelfType) => shelfType === type);
  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  } = usePlaylist(playlistId, { page_limit: PLAYLIST_LIMIT.toString() }, !isPersonalShelf, true);

  let playlist = fetchedPlaylist;

  const favoritesPlaylist = useFavoritesStore((state) => state.getPlaylist());
  const watchHistoryPlaylist = useWatchHistoryStore((state) => state.getPlaylist());

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (type === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (type === PersonalShelf.ContinueWatching) playlist = watchHistoryPlaylist;

  if (!playlistId && !type) {
    throw new Error('Playlist without contentId and type was set in the content config section. Please check the config validity');
  }

  if (!playlist.playlist.length && !showEmpty) {
    return null;
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
