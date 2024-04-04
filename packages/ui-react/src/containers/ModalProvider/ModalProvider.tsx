import { createContext, type PropsWithChildren, type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { logDev } from '@jwp/ott-common/src/utils/common';

import scrollbarSize from '../../utils/dom';

type Modal = {
  modalId: string;
  modalRef: RefObject<HTMLElement>;
  onClose?: () => void;
  containerRef?: RefObject<HTMLElement>;
  lastFocus: Element | null;
};

type ModalContextValue = {
  openModal: (modalId: string, modalRef: RefObject<HTMLElement>, onClose?: () => void, containerRef?: RefObject<HTMLElement>) => void;
  closeModal: (modalId: string, notify?: boolean) => void;
  closeAllModals: (notify?: boolean) => void;
  focusActiveModal: () => void;
  modals: Modal[];
};

export const ModalContext = createContext<ModalContextValue>({
  openModal() {
    throw new Error('Not implemented');
  },
  closeModal() {
    throw new Error('Not implemented');
  },
  closeAllModals() {
    throw new Error('Not implemented');
  },
  focusActiveModal() {
    throw new Error('Not implemented');
  },
  modals: [],
});

const byId = (modalId: string) => (modal: Modal) => modal.modalId === modalId;
const notById = (modalId: string) => (modal: Modal) => modal.modalId !== modalId;

const focusModal = (openedModal: Modal, targetElement?: Element | null) => {
  const { modalRef } = openedModal;

  requestAnimationFrame(() => {
    if (!modalRef.current) return;

    // prefer focusing the targetElement
    if (targetElement && targetElement instanceof HTMLElement && modalRef.current.contains(targetElement)) {
      return targetElement.focus();
    }

    // find the first interactive element
    const interactiveElement = modalRef.current.querySelectorAll('input, a, button, [tabindex]')[0] as HTMLElement | null;

    if (!interactiveElement) {
      logDev('Failed to focus modal contents', { openedModal, targetElement });
    }

    interactiveElement?.focus();
  });
};

const elementIsFocusable = (element: Element | null): element is HTMLElement => {
  const inertElements = document.querySelectorAll('[inert]');
  const parentHasInert = Array.from(inertElements).some((parent) => parent.contains(element));

  return element instanceof HTMLElement && document.body.contains(element) && !parentHasInert;
};

const restoreFocus = (closedModal: Modal, activeModals: Modal[]) => {
  const activeModal = activeModals[activeModals.length - 1];

  // if there is still an active modal, focus that
  if (activeModal) {
    return focusModal(activeModal, closedModal.lastFocus);
  }

  // temp variable because originFocusElement gets cleared
  const originFocus = originFocusElement;

  // focus the last focussed or origin element with fallback to the body element
  requestAnimationFrame(() => {
    if (elementIsFocusable(closedModal.lastFocus)) {
      closedModal.lastFocus.focus({ preventScroll: true });
    } else if (elementIsFocusable(originFocus)) {
      originFocus.focus({ preventScroll: true });
    } else if (document.activeElement instanceof HTMLElement) {
      logDev('Failed to restore focus', { closedModal, originFocus });
      document.activeElement.blur();
      window.focus();
    }
  });
};

let originFocusElement: HTMLElement | null = null;

const getInertTarget = (modal: Modal) => {
  const appView = document.querySelector('#root') as HTMLDivElement | null;
  return modal.containerRef?.current || appView;
};

const handleInert = (targetModal: Modal, activeModals: Modal[]) => {
  const inertTarget = getInertTarget(targetModal);

  if (inertTarget) {
    inertTarget.inert = activeModals.some((modal) => getInertTarget(modal) === inertTarget);
  }
};

const handleBodyScrolling = (activeModals: Modal[]) => {
  if (activeModals.length > 0) {
    document.body.style.marginRight = `${scrollbarSize()}px`;
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.removeProperty('margin-right');
    document.body.style.removeProperty('overflow-y');
  }
};

const ModalProvider = ({ children }: PropsWithChildren) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const keyDownEventHandler = useEventCallback((event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape' && modals.length) {
      closeModal(modals[modals.length - 1].modalId);
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', keyDownEventHandler);

    return () => {
      document.removeEventListener('keydown', keyDownEventHandler);
    };
  }, [keyDownEventHandler]);

  useEffect(() => {
    handleBodyScrolling(modals);

    // keep track of the origin focus element in case we stack multiple modals, for example, sidebar -> account modal
    if (modals.length === 1 && !originFocusElement) {
      originFocusElement = modals[0].lastFocus as HTMLElement;
    } else if (modals.length === 0) {
      originFocusElement = null;
    }
  }, [modals]);

  const openModal = useCallback((modalId: string, modalRef: RefObject<HTMLElement>, onClose?: () => void, containerRef?: RefObject<HTMLElement>) => {
    const modal: Modal = {
      modalId,
      onClose,
      modalRef,
      containerRef,
      lastFocus: document.activeElement,
    };

    setModals((current) => {
      const newModals = [...current, modal];
      focusModal(modal);
      handleInert(modal, newModals);

      return newModals;
    });
  }, []);

  const closeModal = useCallback(
    (modalId: string, notify = true) => {
      const modal = modals.find(byId(modalId));

      if (!modal) return;
      if (notify) modal.onClose?.();

      setModals((current) => {
        const newModals = current.filter(notById(modalId));

        restoreFocus(modal, newModals);
        handleInert(modal, newModals);

        return newModals;
      });
    },
    [modals],
  );

  const closeAllModals = useCallback(
    (notify = true) => {
      // the first modal opened has the correct lastFocus
      const firstModal = modals[0];

      modals.forEach((modal) => {
        if (notify) modal.onClose?.();
        handleInert(modal, []);
      });

      if (firstModal) {
        restoreFocus(firstModal, []);
      }

      setModals([]);
    },
    [modals],
  );

  const focusActiveModal = useCallback(() => {
    const modal = modals[modals.length - 1];

    if (modal) focusModal(modal);
  }, [modals]);

  const value = useMemo(
    () => ({
      openModal,
      closeModal,
      closeAllModals,
      focusActiveModal,
      modals,
    }),
    [closeAllModals, closeModal, focusActiveModal, modals, openModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export default ModalProvider;
