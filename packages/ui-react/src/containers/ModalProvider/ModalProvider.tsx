import { createContext, type PropsWithChildren, type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

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
      document.activeElement.blur();
      window.focus();
    }
  });
};

let originFocusElement: HTMLElement | null = null;
let modalInertElements: HTMLElement[] = [];

const handleInert = (activeModals: Modal[]) => {
  const appView = document.querySelector('#root') as HTMLDivElement | null;

  modalInertElements.forEach((element) => {
    element.inert = false;
  });

  modalInertElements = [];

  if (appView) {
    appView.inert = activeModals.some((modal) => !modal.containerRef);
  }

  activeModals.forEach((modal) => {
    if (modal.containerRef?.current) {
      modalInertElements.push(modal.containerRef.current);
      modal.containerRef.current.inert = true;
    }
  });
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
    handleInert(modals);
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

    focusModal(modal);
    setModals((current) => [...current, modal]);
  }, []);

  const closeModal = useCallback(
    (modalId: string, notify = true) => {
      const modal = modals.find(byId(modalId));
      const newModals = modals.filter(notById(modalId));

      if (modal) {
        if (notify) modal.onClose?.();
        restoreFocus(modal, newModals);
      }

      setModals(newModals);
    },
    [modals],
  );

  const closeAllModals = useCallback(
    (notify = true) => {
      // first modal opened has the lastFocus
      const modal = modals[0];

      if (notify) modals.forEach((modal) => modal.onClose?.());

      restoreFocus(modal, []);
      setModals([]);
    },
    [modals],
  );

  const value = useMemo(
    () => ({
      openModal,
      closeModal,
      closeAllModals,
      modals,
    }),
    [closeAllModals, closeModal, modals, openModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export default ModalProvider;
