import React, { type CSSProperties, useEffect, useRef, useState } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

type Props = {
  className?: string;
  createStyle: (status: Status) => CSSProperties;
  open?: boolean;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
  keepMounted?: boolean;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
};

export type Status = 'opening' | 'open' | 'closing' | 'closed';

const Animation: React.FC<Props> = ({
  className,
  createStyle,
  open = true,
  duration = 250,
  delay = 0,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
  keepMounted = false,
  children,
}) => {
  const [status, setStatus] = useState<Status>('closed');
  const [hasOpenedBefore, setHasOpenedBefore] = useState<boolean>(false);

  const timeout = useRef<number>();
  const timeout2 = useRef<number>();

  // use event callbacks to ignore reactive dependencies
  const openEvent = useEventCallback(() => {
    setHasOpenedBefore(true);
    timeout.current = window.setTimeout(() => setStatus('opening'), delay);
    timeout2.current = window.setTimeout(() => {
      setStatus('open');
      onOpenAnimationEnd && onOpenAnimationEnd();
    }, duration + delay);
  });

  const closeEvent = useEventCallback(() => {
    if (hasOpenedBefore) {
      timeout.current = window.setTimeout(() => setStatus('closing'), delay);
      timeout2.current = window.setTimeout(() => {
        setStatus('closed');
        onCloseAnimationEnd && onCloseAnimationEnd();
      }, duration + delay);
    }
  });

  useEffect(() => {
    if (open) {
      openEvent();
    } else {
      closeEvent();
    }

    return () => {
      clearTimeout(timeout.current);
      clearTimeout(timeout2.current);
    };
  }, [open, openEvent, closeEvent]);

  if (!open && status === 'closed' && !keepMounted) {
    return null;
  }

  return (
    <div style={createStyle(status)} className={className}>
      {children}
    </div>
  );
};

export default Animation;
