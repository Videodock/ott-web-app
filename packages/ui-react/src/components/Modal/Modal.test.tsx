import React from 'react';
import { act } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';

import Modal from './Modal';

describe('<Modal>', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <Modal open={true} onClose={vi.fn()}>
        <p>Test modal</p>
      </Modal>,
    );

    expect(container).toMatchSnapshot();
  });

  test('add overflowY hidden on the body element when open', async () => {
    const onClose = vi.fn();
    const { container, rerender } = await act(() => renderWithRouter(<Modal open={true} onClose={onClose} />));

    expect(container.parentNode).toHaveStyle({ overflowY: 'hidden' });

    act(() => {
      rerender(<Modal open={false} onClose={onClose} />);
    });

    await act(() => vi.runAllTimers()); // wait for close animation

    expect(onClose).toHaveBeenCalled();
    expect(container.parentNode).not.toHaveStyle({ overflowY: 'hidden' });
  });
});
