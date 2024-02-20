import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { testId } from '@jwp/ott-common/src/utils/common';

import Fade from '../Animation/Fade/Fade';
import Grow from '../Animation/Grow/Grow';
import scrollbarSize from '../../utils/dom';

import styles from './Modal.module.scss';

type Props = {
  children?: React.ReactNode;
  AnimationComponent?: React.JSXElementConstructor<{ open?: boolean; duration?: number; delay?: number; children: React.ReactNode }>;
  open: boolean;
  onClose?: () => void;
} & React.AriaAttributes;

const Modal: React.FC<Props> = ({ open, onClose, children, AnimationComponent = Grow, ...ariaAtributes }: Props) => {
  const [visible, setVisible] = useState(open);
  const lastFocus = useRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  const keyDownEventHandler = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  };

  // delay the transition state so the CSS transition kicks in after toggling the `open` prop
  useEffect(() => {
    const activeElement = document.activeElement as HTMLElement;
    const appView = document.querySelector('#root') as HTMLDivElement;

    if (open) {
      // store last focussed element
      if (activeElement) {
        lastFocus.current = activeElement;
      }

      // reset the visible state
      setVisible(true);

      // make sure main content is hidden for screen readers and inert
      if (appView) {
        appView.inert = true;
      }

      // prevent scrolling under the modal
      document.body.style.marginRight = `${scrollbarSize()}px`;
      document.body.style.overflowY = 'hidden';

      // focus the first element in the modal, after a short delay to allow the modal to be rendered
      setTimeout(() => {
        if (modalRef.current) {
          const interactiveElement = modalRef.current.querySelectorAll(
            'div[role="dialog"] input, div[role="dialog"] a, div[role="dialog"] button, div[role="dialog"] [tabindex]',
          )[0] as HTMLElement | null;

          if (interactiveElement) interactiveElement.focus();
        }
      }, 10);
    } else {
      if (appView) {
        appView.inert = false;
      }

      document.body.style.removeProperty('margin-right');
      document.body.style.removeProperty('overflow-y');

      // restore last focussed element
      if (lastFocus.current) {
        lastFocus.current.focus();
      }
    }
  }, [open]);

  if (!open && !visible) return null;

  return ReactDOM.createPortal(
    <Fade open={open} duration={300} onCloseAnimationEnd={() => setVisible(false)}>
      <div className={styles.modal} onKeyDown={keyDownEventHandler} ref={modalRef}>
        <div className={styles.backdrop} onClick={onClose} data-testid={testId('backdrop')} />
        <div className={styles.container} {...ariaAtributes}>
          <AnimationComponent open={open} duration={200}>
            {children}
          </AnimationComponent>
        </div>
      </div>
    </Fade>,
    document.querySelector('body') as HTMLElement,
  );
};

export default Modal;
