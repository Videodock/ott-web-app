import React, { useState, type CSSProperties, type TransitionEventHandler } from 'react';
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

type Animation = {
  direction?: 'left' | 'right';
  phase?: 'initial' | 'start' | 'end';
};

const FeaturedShelf = ({ playlist, loading = false, error = null }: Props) => {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const { t } = useTranslation('common');
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint <= Breakpoint.sm;
  const scrolledDown = useScrolledDown(500, 200);
  const [animation, setAnimation] = useState<Animation | null>(null);

  const slideTo = (toIndex: number) => {
    if (animation) return;

    const direction = toIndex > index ? 'right' : 'left';

    setNextIndex(toIndex);
    setAnimation({ direction, phase: 'initial' });
    setTimeout(() => setAnimation({ direction, phase: 'start' }), 1); // After next render
  };

  const slideLeft = () => slideTo(index - 1);
  const slideRight = () => slideTo(index + 1);

  const handlingTransitionEnd = React.useRef(false);

  // Background animation takes longest, so it leads our animation flow
  const handleBackgroundAnimationEnd: TransitionEventHandler = () => {
    if (handlingTransitionEnd.current) return;
    if (animation?.phase !== 'start') return;

    handlingTransitionEnd.current = true; // Prevent multiple calls from different animations

    setTimeout(() => {
      setAnimation((current) => ({ ...current, phase: 'end' }));
      setTimeout(() => {
        setAnimation(null);
        setIndex(nextIndex);
        handlingTransitionEnd.current = false;
      }, 1); // Next render
    }, 250); // Difference between shortest and longest animation
  };

  const isAnimating = animation?.phase === 'start' || animation?.phase === 'end';
  const directionFactor = animation?.direction === 'left' ? 1 : animation?.direction === 'right' ? -1 : 0;

  // Background animation
  const backgroundX = 40;
  const backgroundCurrentStyle: CSSProperties = {
    transform: `scale(1.2) translateX(${isAnimating ? backgroundX * directionFactor : 0}px)`,
    opacity: isAnimating ? 0 : 1,
    transition: isAnimating ? 'opacity 0.1s ease-out, transform 0.3s ease-in' : 'none',
  };
  const backgroundAltStyle: CSSProperties = {
    transform: `scale(1.2) translateX(${animation?.phase === 'initial' ? backgroundX * directionFactor * -1 : 0}px)`,
    opacity: isAnimating ? 1 : 0,
    transition: isAnimating ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none',
  };

  // Metadata animation
  const left = 60;
  const metadataCurrentStyle: CSSProperties = {
    left: isAnimating && animation?.direction ? left * directionFactor : 0,
    opacity: isAnimating ? 0 : 1,
    transition: isAnimating ? 'opacity 0.15s ease-out, left 0.15s ease-out' : 'none',
    pointerEvents: isAnimating ? 'none' : 'initial',
  };

  const metadataAltStyle: CSSProperties = {
    left: animation?.phase === 'initial' ? left * directionFactor * -1 : 0,
    opacity: isAnimating ? 1 : 0,
    transition: isAnimating ? 'opacity 0.2s ease-out, left 0.2s ease-out' : 'none',
    pointerEvents: 'none',
  };

  const item = playlist.playlist[index];
  const leftItem = index - 1 >= 0 ? playlist.playlist[index - 1] : null;
  const rightItem = index + 1 < playlist.playlist.length ? playlist.playlist[index + 1] : null;

  const renderedItem = animation?.phase !== 'end' ? item : animation?.direction === 'right' ? rightItem : leftItem;
  const altItem = animation?.direction === 'right' ? rightItem : leftItem;

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf)}>
      <div className={classNames(styles.poster, styles.undimmed, { [styles.dimmed]: scrolledDown })}>
        <div className={styles.background} id="background">
          <FeaturedBackground item={renderedItem} style={backgroundCurrentStyle} id="main_background" onTransitionEnd={handleBackgroundAnimationEnd} />
          <FeaturedBackground item={altItem} style={backgroundAltStyle} hidden={!animation} />
          <div className={styles.fade} />
        </div>
        <div className={styles.fade2} />
      </div>
      <button
        className={classNames(styles.chevron, styles.chevronLeft, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_previous')}
        disabled={!leftItem}
        onClick={leftItem ? slideLeft : undefined}
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
          isAnimating={isAnimating}
          onSlideLeft={slideLeft}
          onSlideRight={slideRight}
        />
      ) : (
        <>
          <FeaturedMetadata item={renderedItem} loading={loading} playlistId={playlist.feedid} style={metadataCurrentStyle} />
          <FeaturedMetadata item={altItem} loading={loading} playlistId={playlist.feedid} style={metadataAltStyle} hidden={!animation} />
        </>
      )}
      <button
        className={classNames(styles.chevron, styles.chevronRight, styles.undimmed, { [styles.dimmed]: scrolledDown })}
        aria-label={t('slide_next')}
        disabled={!rightItem}
        onClick={rightItem ? slideRight : undefined}
      >
        <Icon icon={ChevronRight} />
      </button>
      <FeaturedPagination
        className={scrolledDown ? styles.dimmed : undefined}
        playlist={playlist}
        index={index}
        setIndex={slideTo}
        nextIndex={nextIndex}
        direction={animation?.direction || false}
      />
    </div>
  );
};

export default FeaturedShelf;
