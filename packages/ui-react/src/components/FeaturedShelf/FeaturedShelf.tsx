import React, { useRef, useState, type CSSProperties } from 'react';
import type { PosterAspectRatio } from '@jwp/ott-common/src/utils/collection';
import type { AccessModel } from '@jwp/ott-common/types/config';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import classNames from 'classnames';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { useTranslation } from 'react-i18next';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';
import { useNavigate } from 'react-router';

import { useScrolledDown } from '../../hooks/useScrolledDown';
import TruncatedText from '../TruncatedText/TruncatedText';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import Image from '../Image/Image';
import StartWatchingButton from '../../containers/StartWatchingButton/StartWatchingButton';

import styles from './FeaturedShelf.module.scss';

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

const FeaturedBackground = ({ item, style }: { item: PlaylistItem; style: CSSProperties }) => {
  const image = item.images.find((img) => img.width === 1920)?.src || item?.backgroundImage;

  if (!item) return null;

  return (
    <div style={style}>
      <Image className={styles.image} image={image} width={1920} alt={item?.title} />
    </div>
  );
};

const FeaturedMetadata = ({
  item,
  loading,
  playlistId,
  style,
}: {
  item: PlaylistItem;
  loading: boolean;
  playlistId: string | undefined;
  style: CSSProperties;
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.metadata} style={style}>
      <h2 className={classNames(loading ? styles.loadingTitle : styles.title)}>{!loading && item?.title}</h2>
      <TruncatedText text={item?.description} maximumLines={3} className={styles.description} />
      <div>
        <StartWatchingButton item={item} playUrl={mediaURL({ id: item.mediaid, title: item.title, playlistId, play: true })} />
        <Button
          label={'More like this'}
          onClick={() => !!item && navigate(mediaURL({ id: item.mediaid, title: item.title, playlistId }))}
          startIcon={<Icon icon={ChevronRight} />}
        />
      </div>
    </div>
  );
};

const FeaturedShelf = ({ playlist, loading = false, error = null }: Props) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation('common');
  const isTransitioningRef = useRef(false);

  const item = playlist.playlist[index];
  const prevItem = playlist.playlist[index - 1 >= 0 ? index - 1 : playlist.playlist.length - 1];
  const nextItem = playlist.playlist[index + 1 < playlist.playlist.length ? index + 1 : 0];

  const scrolledDown = useScrolledDown(500);
  const [animating, setAnimating] = useState<'left' | 'left-end' | 'right' | 'right-end' | false>(false);

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
  const distanceMetadata = 50;
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
      <div className={classNames(styles.dots, styles.undimmed, { [styles.dimmed]: scrolledDown })}>
        {playlist.playlist.map((current, itemIndex) => (
          <button
            className={classNames(
              styles.dot,
              animating &&
                playlist.playlist.findIndex(({ mediaid }) => mediaid === (['left', 'left-end'].includes(animating) ? prevItem : nextItem).mediaid) ===
                  itemIndex &&
                styles.dotActive,
              !animating && itemIndex === index && styles.dotActive,
            )}
            aria-label={`Show item ${index + 1} of ${playlist.playlist.length}`}
            key={current.mediaid}
            onClick={() => setIndex(itemIndex)}
          >
            <div />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeaturedShelf;
