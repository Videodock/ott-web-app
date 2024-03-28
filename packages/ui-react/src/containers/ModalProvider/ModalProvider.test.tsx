import React, { type RefObject, useRef } from 'react';
import { fireEvent, render } from '@testing-library/react';

import ModalProvider from './ModalProvider';
import { useModal } from './useModal';

type Props = {
  open: boolean;
  onClose?: () => void;
  modalRef: RefObject<HTMLElement>;
  containerRef?: RefObject<HTMLElement>;
};

const TestModal = ({ open, onClose, containerRef, name }: Omit<Props, 'modalRef'> & { name: string }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModal({ open, onClose, containerRef, modalRef });

  if (!open) {
    return null;
  }

  return (
    <div data-testid={`modal-${name}`} ref={modalRef}>
      <button onClick={onClose}>close {name}</button>
    </div>
  );
};

const renderSingleModal = (open: boolean, onClose?: () => void) => {
  return (
    <ModalProvider>
      <>
        <div id="root" data-testid="root">
          <button onClick={vi.fn()}>last focus</button>
        </div>
        <TestModal open={open} onClose={onClose} name="modal-1" />
      </>
    </ModalProvider>
  );
};

const renderMultiModal = (open: boolean, secondOpen: boolean, onClose?: () => void, onSecondClose?: () => void) => {
  return (
    <ModalProvider>
      <>
        <div id="root" data-testid="root">
          <button onClick={vi.fn()}>last focus</button>
        </div>
        <TestModal open={open} onClose={onClose} name="modal-1" />
        <TestModal open={secondOpen} onClose={onSecondClose} name="modal-2" />
      </>
    </ModalProvider>
  );
};

describe('<ModalProvider />', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('renders provider with test modal', () => {
    const { container, getByTestId } = render(renderSingleModal(true));

    expect(container).toMatchSnapshot();
    expect(getByTestId('root')).toHaveAttribute('inert');
  });

  test('clears inert when all modals are closed', () => {
    const onClose = vi.fn();

    const { getByTestId, getByText, rerender } = render(renderSingleModal(true, onClose));

    expect(getByTestId('root')).toHaveAttribute('inert');

    fireEvent.click(getByText('close modal-1'));

    rerender(renderSingleModal(false, onClose));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(getByTestId('root')).not.toHaveAttribute('inert');
    expect(document.activeElement).toBe(document.body);
  });

  test('focus the first interactive element', () => {
    const onClose = vi.fn();

    const { getByText, rerender } = render(renderSingleModal(false, onClose));

    rerender(renderSingleModal(true, onClose));
    vi.runAllTimers();

    expect(document.activeElement).toBe(getByText('close modal-1'));
  });

  test('restores focus to the last active element', () => {
    const { getByText, rerender } = render(renderSingleModal(false));

    // focus button
    getByText('last focus').focus();

    rerender(renderSingleModal(true));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('close modal-1'));

    rerender(renderSingleModal(false));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('last focus'));
  });

  test('restores focus to the last active element when multiple modals are opened and closed', () => {
    const { getByText, rerender } = render(renderMultiModal(false, false));

    // focus button
    getByText('last focus').focus();

    rerender(renderMultiModal(true, false));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('close modal-1'));

    rerender(renderMultiModal(true, true));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('close modal-2'));

    rerender(renderMultiModal(true, false));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('close modal-1'));

    rerender(renderMultiModal(false, false));

    vi.runAllTimers();
    expect(document.activeElement).toBe(getByText('last focus'));
  });
});
