import React, { useRef, useState, type CSSProperties } from 'react';
import type { PosterAspectRatio } from '@jwp/ott-common/src/utils/collection';
import type { AccessModel } from '@jwp/ott-common/types/config';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';

import { useScrolledDown } from '../../hooks/useScrolledDown';
import Icon from '../Icon/Icon';

import styles from './FeaturedShelf.module.scss';
import FeaturedMetadata from './FeaturedMetadata';
import FeaturedBackground from './FeaturedBackground';
import FeaturedPagination from './FeaturedPagination';

type Props = {
  playlist: Playlist;
  onCardHover?: (playlistItem: PlaylistItem) => void;
  watchHistory?: { [key: string]: number };
  enableTitle?: boolean;
  enableCardTitles?: boolean;
  featured?: boolean;
  loading?: boolean;
  error?: unknown;
  title?: string;
  accessModel: AccessModel;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  posterAspect?: PosterAspectRatio;
  visibleTilesDelta?: number;
};

export type Animating = 'left' | 'left-end' | 'right' | 'right-end' | false;

const FeaturedShelf = ({ playlist, loading = false, error = null }: Props) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation('common');
  const isTransitioningRef = useRef(false);

  const item = playlist.playlist[index];
  const prevItem = playlist.playlist[index - 1 >= 0 ? index - 1 : playlist.playlist.length - 1];
  const nextItem = playlist.playlist[index + 1 < playlist.playlist.length ? index + 1 : 0];

  const scrolledDown = useScrolledDown(500);
  const [animating, setAnimating] = useState<Animating>(false);

  const handleLeftClick = () => {
    if (animating) return;
    setAnimating('left');
    isTransitioningRef.current = true;
  };
  const handleRightClick = () => {
    if (animating) return;
    setAnimating('right');
    isTransitioningRef.current = true;
  };

  const handleAnimationEnd = () => {
    if (!isTransitioningRef.current) return;
    isTransitioningRef.current = false;

    if (animating === 'left') {
      setAnimating('left-end');
      setTimeout(() => {
        setIndex((cur) => (cur === 0 ? playlist.playlist.length - 1 : cur - 1));
        setAnimating(false);
      }, 200); // Should cover the time between shortest and longest animation
    }
    if (animating === 'right') {
      setAnimating('right-end');
      setTimeout(() => {
        setIndex((cur) => (cur === playlist.playlist.length - 1 ? 0 : cur + 1));
        setAnimating(false);
      }, 200); // Should cover the time between shortest and longest animation
    }
  };

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  // Background animation
  const transitionBackgroundIn = animating ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none';
  const transitionBackgroundOut = animating ? 'opacity 0.1s ease-out, transform 0.1s ease-out' : 'none';
  const distanceBackground = 50;
  const backgroundPrevStyle: CSSProperties = {
    transform: `scale(1.2) translateX(${animating === 'left' || animating === 'left-end' ? 0 : -distanceBackground}px)`,
    opacity: animating === 'left' || animating === 'left-end' ? 1 : 0,
    transition: transitionBackgroundIn,
  };
  const backgroundCurrentStyle: CSSProperties = {
    transform: `scale(1.2) translateX(${animating === 'left' ? distanceBackground : animating === 'right' ? -distanceBackground : 0}px)`,
    opacity: animating ? 0 : 1,
    transition: transitionBackgroundOut,
  };
  const backgroundNextStyle: CSSProperties = {
    transform: `scale(1.2) translateX(${animating === 'right' || animating === 'right-end' ? 0 : distanceBackground}px)`,
    opacity: animating === 'right' || animating === 'right-end' ? 1 : 0,
    transition: transitionBackgroundIn,
  };

  // Metadata animation
  const transitionMetadataIn = animating ? 'opacity 0.2s ease-out, left 0.2s ease-out, right 0.2s ease-out' : 'none';
  const transitionMetadataOut = animating ? 'opacity 0.1s ease-out, left 0.1s ease-out, right 0.1s ease-out' : 'none';
  const distanceMetadata = 70;
  const metadataPrevStyle: CSSProperties = {
    left: animating === 'left' || animating === 'left-end' ? 0 : -distanceMetadata,
    opacity: animating === 'left' || animating === 'left-end' ? 1 : 0,
    transition: transitionMetadataIn,
    pointerEvents: 'none',
  };
  const metadataCurrentStyle: CSSProperties = {
    left: animating === 'left' ? distanceMetadata : animating === 'right' ? -distanceMetadata : 0,
    opacity: animating ? 0 : 1,
    transition: transitionMetadataOut,
    pointerEvents: animating ? 'none' : 'initial',
  };
  const metadataNextStyle: CSSProperties = {
    left: animating === 'right' || animating === 'right-end' ? 0 : distanceMetadata,
    opacity: animating === 'right' || animating === 'right-end' ? 1 : 0,
    transition: transitionMetadataIn,
    pointerEvents: 'none',
  };

  return (
    <div className={classNames(styles.shelf)}>
      <div className={classNames(styles.poster, styles.undimmed, { [styles.dimmed]: scrolledDown })}>
        <div className={styles.background} onTransitionEnd={handleAnimationEnd}>
          <FeaturedBackground item={prevItem} style={backgroundPrevStyle} />
          <FeaturedBackground item={animating === 'left-end' ? prevItem : animating === 'right-end' ? nextItem : item} style={backgroundCurrentStyle} />
          <FeaturedBackground item={nextItem} style={backgroundNextStyle} />
          <div className={styles.fade} />
        </div>
        <div className={styles.fade2} />
      </div>
      <button
        className={classNames(styles.chevron, styles.chevronLeft, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_previous')}
        onClick={handleLeftClick}
      >
        <Icon icon={ChevronLeft} />
      </button>
      <FeaturedMetadata item={prevItem} loading={loading} playlistId={playlist.feedid} style={metadataPrevStyle} />
      <FeaturedMetadata
        item={animating === 'left-end' ? prevItem : animating === 'right-end' ? nextItem : item}
        loading={loading}
        playlistId={playlist.feedid}
        style={metadataCurrentStyle}
      />
      <FeaturedMetadata item={nextItem} loading={loading} playlistId={playlist.feedid} style={metadataNextStyle} />
      <button
        className={classNames(styles.chevron, styles.chevronRight, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_next')}
        onClick={handleRightClick}
      >
        <Icon icon={ChevronRight} />
      </button>
      <FeaturedPagination
        playlist={playlist}
        dimmed={scrolledDown}
        index={index}
        setIndex={setIndex}
        prevItem={prevItem}
        nextItem={nextItem}
        animating={animating}
      />
    </div>
  );
};

export default FeaturedShelf;
