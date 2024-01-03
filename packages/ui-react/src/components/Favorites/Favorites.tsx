import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AccessModel } from '@jwp/ott-common/types/config';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import { mediaURL } from '@jwp/ott-common/src/utils/formatting';
import { Breakpoint, Breakpoints } from '@jwp/ott-hooks-react/src/useBreakpoint';

import Button from '../Button/Button';
import CardGrid from '../CardGrid/CardGrid';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import ErrorPage from '../ErrorPage/ErrorPage';

import styles from './Favorites.module.scss';

type Props = {
  playlist: Playlist;
  error: unknown;
  isLoading: boolean;
  accessModel: AccessModel;
  hasSubscription: boolean;
  onCardHover?: (item: PlaylistItem) => void;
  onClearFavoritesClick: () => void;
};

const cols: Breakpoints = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 3,
  [Breakpoint.md]: 3,
  [Breakpoint.lg]: 3,
  [Breakpoint.xl]: 3,
};

const Favorites = ({ playlist, error, isLoading, accessModel, hasSubscription, onCardHover, onClearFavoritesClick }: Props): JSX.Element => {
  const { t } = useTranslation('user');

  if (isLoading) return <LoadingOverlay />;

  if (error || !playlist) {
    return <ErrorPage title={t('favorites.not_found')} />;
  }

  const getURL = (playlistItem: PlaylistItem) => mediaURL({ media: playlistItem, playlistId: playlistItem.feedid });

  return (
    <div>
      <div className={styles.header}>
        <h1>{t('favorites.title')}</h1>
        {playlist.playlist.length > 0 ? <Button label={t('favorites.clear')} onClick={onClearFavoritesClick} /> : null}
      </div>
      {playlist.playlist.length > 0 ? (
        <CardGrid
          getUrl={getURL}
          playlist={playlist}
          onCardHover={onCardHover}
          cols={cols}
          isLoading={isLoading}
          accessModel={accessModel}
          isLoggedIn={true}
          hasSubscription={hasSubscription}
        />
      ) : (
        <p>{t('favorites.no_favorites')}</p>
      )}
    </div>
  );
};

export default Favorites;
