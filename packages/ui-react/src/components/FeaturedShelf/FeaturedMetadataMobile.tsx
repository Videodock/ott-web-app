import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import FeaturedMetadata from './FeaturedMetadata';
import styles from './FeaturedShelf.module.scss';

type Props = {
  item: PlaylistItem;
  leftItem: PlaylistItem | null;
  rightItem: PlaylistItem | null;
  playlistId: string | undefined;
  loading: boolean;
  direction: 'left' | 'right' | null;
  onSlideLeft: () => void;
  onSlideRight: () => void;
};

const FeaturedMetadataMobile = ({ item, leftItem, rightItem, playlistId, loading, direction, onSlideLeft, onSlideRight }: Props) => {
  const movementRef = useRef({ x: 0, y: 0, start: Date.now() });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [swipeAction, setSwipeAction] = useState<'slide' | 'scroll' | null>(null);

  const handleTouchStart = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    movementRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, start: Date.now() };
    setSwipeAction(null);
  });

  const handleTouchMove = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    if (!containerRef.current) return;

    const movementX: number = event.changedTouches[0].clientX - movementRef.current.x;
    const movementY: number = event.changedTouches[0].clientY - movementRef.current.y;
    const currentSwipeAction = Math.abs(movementX) > Math.abs(movementY) ? 'slide' : 'scroll';

    if (!swipeAction) setSwipeAction(currentSwipeAction);
    if (currentSwipeAction === 'scroll' || swipeAction === 'scroll') return;

    // Prevent scrolling while sliding
    event.preventDefault();
    event.stopPropagation();

    // Follow touch horizontally
    const maxLeft = rightItem ? -window.innerWidth : 0;
    const maxRight = leftItem ? window.innerWidth : 0;
    const limitedMovementX = Math.max(Math.min(movementX, maxRight), maxLeft);

    containerRef.current.style.transform = `translateX(${limitedMovementX}px)`;
    containerRef.current.style.transition = 'none';
  });

  const handleTouchEnd = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    if (!containerRef.current) return;
    if (swipeAction === 'scroll') return;

    const movementX = movementRef.current.x - event.changedTouches[0].clientX;
    const velocity = Math.round((movementX / (Date.now() - movementRef.current.start)) * 100);
    const velocityTreshold = 80;

    if (rightItem && (movementX > window.innerWidth / 2 || velocity > velocityTreshold)) {
      onSlideRight();
    } else if (leftItem && (movementX < -window.innerWidth / 2 || velocity < -velocityTreshold)) {
      onSlideLeft();
    } else {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = 'translateX(0)';
    }
    setSwipeAction(null);
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    if (direction === 'left') {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = `translateX(100%)`;
    } else if (direction === 'right') {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = `translateX(-100%)`;
    } else {
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.transition = 'none';
    }
  }, [direction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className={styles.metadataMobile}>
      <FeaturedMetadata
        loading={loading}
        item={leftItem}
        playlistId={playlistId}
        style={{ left: '-100%' }}
        hidden={direction !== 'left' && swipeAction !== 'slide'}
      />
      <FeaturedMetadata loading={loading} item={item} playlistId={playlistId} />
      <FeaturedMetadata
        loading={loading}
        item={rightItem}
        playlistId={playlistId}
        style={{ left: '100%' }}
        hidden={direction !== 'right' && swipeAction !== 'slide'}
      />
    </div>
  );
};

export default FeaturedMetadataMobile;
