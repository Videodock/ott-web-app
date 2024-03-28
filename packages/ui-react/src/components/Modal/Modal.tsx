import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { testId } from '@jwp/ott-common/src/utils/common';

import Fade from '../Animation/Fade/Fade';
import Grow from '../Animation/Grow/Grow';
import { useModal } from '../../containers/ModalProvider/useModal';

import styles from './Modal.module.scss';

type Props = {
  children?: React.ReactNode;
  AnimationComponent?: React.JSXElementConstructor<{ open?: boolean; duration?: number; delay?: number; children: React.ReactNode; className?: string }>;
  open: boolean;
  onClose?: () => void;
  animationContainerClassName?: string;
} & React.AriaAttributes;

const Modal: React.FC<Props> = ({ open, onClose, children, AnimationComponent = Grow, animationContainerClassName, ...ariaAttributes }: Props) => {
  const modalRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  useModal({ open, onClose, modalRef });

  return ReactDOM.createPortal(
    <Fade open={open} duration={300}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.backdrop} onClick={onClose} data-testid={testId('backdrop')} />
        <div className={styles.container} {...ariaAttributes}>
          <AnimationComponent open={open} duration={200} className={animationContainerClassName}>
            {children}
          </AnimationComponent>
        </div>
      </div>
    </Fade>,
    document.querySelector('body') as HTMLElement,
  );
};

export default Modal;
