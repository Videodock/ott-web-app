import { type RefObject, useContext, useEffect, useRef } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

import { ModalContext } from './ModalProvider';

type Params = {
  open: boolean;
  onClose?: () => void;
  modalRef: RefObject<HTMLElement>;
  containerRef?: RefObject<HTMLElement>;
};

export const useModal = ({ open, onClose, modalRef, containerRef }: Params) => {
  const modalId = useRef(String(Math.round(Math.random() * 1_000_000))).current;
  const { openModal, closeModal, modals } = useContext(ModalContext);
  const isOpen = modals.some((modal) => modal.modalId === modalId);

  // replace with React `useEffectEvent` when stable: https://react.dev/reference/react/experimental_useEffectEvent
  const openModalEvent = useEventCallback(() => {
    if (open) {
      openModal(modalId, modalRef, onClose, containerRef);
    } else if (isOpen) {
      closeModal(modalId, false);
    }
  });
  const closeModalEvent = useEventCallback(() => {
    if (isOpen) {
      closeModal(modalId, false);
    }
  });

  useEffect(() => {
    // react when the `open` prop changes
    openModalEvent();
  }, [open, openModalEvent]);

  useEffect(() => {
    return () => {
      // cleanup open modal when this component unmounts (without the `open` prop to false)
      closeModalEvent();
    };
  }, [closeModalEvent]);

  return {
    isOpen,
    closeModal: closeModalEvent,
    open,
  };
};
