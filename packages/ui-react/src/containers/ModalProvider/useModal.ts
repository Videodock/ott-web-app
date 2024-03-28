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

  const onCloseCallback = useEventCallback(onClose);

  useEffect(() => {
    if (open) {
      openModal(modalId, modalRef, onCloseCallback, containerRef);
    } else if (isOpen) {
      closeModal(modalId, false);
    }
    // only react to `open` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      isOpen && closeModal(modalId, false);
    };
    // unmount only to unregister the modal when it was open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => closeModal(modalId);

  return {
    isOpen,
    closeModal: close,
    open,
  };
};
