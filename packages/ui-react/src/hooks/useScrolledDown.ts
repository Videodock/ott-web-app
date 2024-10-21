import { useEffect, useRef, useState } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

export const useScrolledDown = (scrollUpHeight = 300, scrollDownHeight = 30) => {
  const scrollingElement = document.scrollingElement || document.body;
  const scrollTopRef = useRef(scrollingElement.scrollTop);
  const [scrolledDown, setScrolledDown] = useState(false);

  const handleScroll = useEventCallback(() => {
    const scrollPosition = scrollingElement.scrollTop;
    const direction = scrollTopRef.current > scrollPosition ? 'up' : 'down';

    scrollTopRef.current = scrollPosition;

    // toggle the scrolledDown based on the direction to
    setScrolledDown((direction === 'up' && scrollPosition > scrollUpHeight) || (direction === 'down' && scrollPosition > scrollDownHeight));
  });

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return scrolledDown;
};
