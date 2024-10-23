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
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './FeaturedShelf.module.scss';
import FeaturedMetadata from './FeaturedMetadata';
import FeaturedBackground from './FeaturedBackground';
import FeaturedPagination from './FeaturedPagination';
import FeaturedMetadataMobile from './FeaturedMetadataMobile';

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
  const [nextIndex, setNextIndex] = useState(0);
  const { t } = useTranslation('common');
  const isTransitioningRef = useRef(false);

  const breakpoint = useBreakpoint();
  const isMobile = breakpoint <= Breakpoint.sm;

  const item = playlist.playlist[index];
  const leftItem = index - 1 >= 0 ? playlist.playlist[index - 1] : null;
  const rightItem = index + 1 < playlist.playlist.length ? playlist.playlist[index + 1] : null;

  const scrolledDown = useScrolledDown(500);
  const [animating, setAnimating] = useState<Animating>(false);

  const slideTo = (toIndex: number) => {
    if (animating) return;
    setAnimating(toIndex <= index ? 'left' : 'right');
    setNextIndex(toIndex);
    isTransitioningRef.current = true;
  };

  const slideLeft = () => {
    if (animating) return;
    setAnimating('left');
    setNextIndex(index - 1 >= 0 ? index - 1 : playlist.playlist.length - 1);
    isTransitioningRef.current = true;
  };
  const slideRight = () => {
    if (animating) return;
    setAnimating('right');
    setNextIndex(index + 1 < playlist.playlist.length ? index + 1 : 0);
    isTransitioningRef.current = true;
  };

  const handleAnimationEnd = () => {
    if (!isTransitioningRef.current) return;
    isTransitioningRef.current = false;

    if (animating === 'left') {
      setAnimating('left-end');
    }
    if (animating === 'right') {
      setAnimating('right-end');
    }
    setTimeout(() => {
      setIndex(nextIndex);
      setAnimating(false);
    }, 200); // Should cover the time between shortest and longest animation
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
          <FeaturedBackground item={leftItem} style={backgroundPrevStyle} hidden />
          <FeaturedBackground item={animating === 'left-end' ? leftItem : animating === 'right-end' ? rightItem : item} style={backgroundCurrentStyle} />
          <FeaturedBackground item={rightItem} style={backgroundNextStyle} hidden />
          <div className={styles.fade} />
        </div>
        <div className={styles.fade2} />
      </div>
      <button
        className={classNames(styles.chevron, styles.chevronLeft, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_previous')}
        disabled={!leftItem}
        onClick={slideLeft}
      >
        <Icon icon={ChevronLeft} />
      </button>
      {isMobile ? (
        <FeaturedMetadataMobile
          loading={loading}
          item={item}
          rightItem={rightItem}
          leftItem={leftItem}
          playlistId={playlist.feedid}
          onSlideLeft={slideLeft}
          onSlideRight={slideRight}
        />
      ) : (
        <>
          <FeaturedMetadata item={leftItem} loading={loading} playlistId={playlist.feedid} style={metadataPrevStyle} hidden={!animating} />
          <FeaturedMetadata
            item={animating === 'left-end' ? leftItem : animating === 'right-end' ? rightItem : item}
            loading={loading}
            playlistId={playlist.feedid}
            style={metadataCurrentStyle}
          />
          <FeaturedMetadata item={rightItem} loading={loading} playlistId={playlist.feedid} style={metadataNextStyle} hidden={!animating} />
        </>
      )}
      <button
        className={classNames(styles.chevron, styles.chevronRight, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_next')}
        disabled={!rightItem}
        onClick={slideRight}
      >
        <Icon icon={ChevronRight} />
      </button>
      <FeaturedPagination
        className={scrolledDown ? styles.dimmed : undefined}
        playlist={playlist}
        index={index}
        setIndex={slideTo}
        nextIndex={nextIndex}
        animating={!animating ? false : ['left', 'left-end'].includes(animating) ? 'left' : ['right', 'right-end'].includes(animating) ? 'right' : false}
      />
    </div>
  );
};

export default FeaturedShelf;
