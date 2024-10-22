import classNames from 'classnames';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import styles from './FeaturedShelf.module.scss';

type Props = {
  playlist: Playlist;
  index: number;
  animating: 'left' | 'right' | false;
  nextIndex: number;
  setIndex: (index: number) => void;
  range?: number;
  animationDuration?: number;
  className?: string;
};

const FeaturedPagination = ({
  playlist,
  index: indexIn,
  animating,
  nextIndex: nextIndexIn,
  setIndex,
  range = 3,
  animationDuration = 200,
  className,
}: Props) => {
  // @todo: translation
  const { t } = useTranslation('common');
  const placeholderCount = range + 1; // Needed to keep a stable count of dom elements
  const index = indexIn + placeholderCount;
  const nextIndex = nextIndexIn + placeholderCount;

  const playlistWithPlaceholders = useMemo(() => {
    const placeholders: false[] = Array.from({ length: placeholderCount }).map(() => false);

    return [...placeholders, ...playlist.playlist, ...placeholders];
  }, [playlist.playlist, placeholderCount]);

  const movementBase = 22;

  return (
    <div className={classNames(styles.dots, styles.undimmed, className)}>
      <div aria-live="polite" className="hidden">
        {t('slide_indicator', { page: indexIn + 1, pages: playlist.playlist.length })}
      </div>
      {playlistWithPlaceholders.map((current, itemIndex) => {
        const calculateDotSize = () => {
          const isAnimatingLeft = animating === 'left';
          const isAnimatingRight = animating === 'right';

          const sizeSmall = 0.6;

          const isSemiEdgeDotRight = itemIndex === index + range - 1;
          const isEdgeDotRight = itemIndex === index + range;
          const isNewDotRight = itemIndex === index + range + 1;

          const isSemiEdgeDotLeft = itemIndex === index - range + 1;
          const isEdgeDotLeft = itemIndex === index - range;
          const isNewDotLeft = itemIndex === index - range - 1;

          const isPlaceholder = current === undefined;

          if (isPlaceholder) return 0;

          if (isSemiEdgeDotRight) {
            if (isAnimatingLeft) return 0.6;
          }
          if (isEdgeDotRight) {
            if (isAnimatingLeft) return 0;

            return isAnimatingRight ? 1 : sizeSmall;
          }
          if (isNewDotRight) {
            return isAnimatingRight ? sizeSmall : 0;
          }

          if (isSemiEdgeDotLeft) {
            if (isAnimatingRight) return 0.6;
          }
          if (isEdgeDotLeft) {
            if (isAnimatingRight) return 0;

            return isAnimatingLeft ? 1 : sizeSmall;
          }
          if (isNewDotLeft) {
            return isAnimatingLeft ? sizeSmall : 0;
          }

          return 1;
        };

        // Dot container
        const movementTotal = Math.abs(index - nextIndex) * movementBase;
        const movement = animating === 'left' ? movementTotal : animating === 'right' ? 0 - movementTotal : 0;
        const transform = `translateX(${movement}px)`;
        const transition = animating
          ? `transform ${animationDuration}ms ease-out ${animationDuration / 3}ms, width ${animationDuration / 2}ms ease-out ${animationDuration / 3}ms`
          : '';

        // Dot
        const size = calculateDotSize();
        const transformDiv = `scale(${calculateDotSize()})`;
        const transitionDiv = animating
          ? `width ${animationDuration}ms ease-out, height ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`
          : '';

        if (itemIndex < index - range - 1 || itemIndex > index + range + 1) {
          return null;
        }

        // Placeholder
        if (!current) {
          return <div className={classNames(styles.dot)} key={itemIndex} aria-hidden="true" />;
        }

        const isCurrent = itemIndex === index;
        const hidden = size !== 1;
        const ariaLabel = hidden ? undefined : t('slide_to', { page: itemIndex - placeholderCount + 1, pages: playlist.playlist.length });

        return (
          <button
            key={current?.mediaid}
            className={classNames(styles.dot, itemIndex === nextIndex && styles.dotActive, !animating && itemIndex === index && styles.dotActive)}
            style={{ transform, transition }}
            aria-label={ariaLabel}
            aria-hidden={hidden ? 'true' : undefined}
            disabled={hidden}
            aria-current={isCurrent ? 'true' : undefined}
            onClick={hidden || isCurrent ? undefined : () => setIndex(itemIndex - placeholderCount)}
          >
            <div style={{ transform: transformDiv, transition: transitionDiv }} />
          </button>
        );
      })}
    </div>
  );
};

export default FeaturedPagination;
