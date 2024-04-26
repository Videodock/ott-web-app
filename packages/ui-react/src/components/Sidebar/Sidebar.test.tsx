import React from 'react';
import { act } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';
import Button from '../Button/Button';

import Sidebar from './Sidebar';

describe('<SideBar />', () => {
  const playlistMenuItems = [<Button key="key" label="Home" to="/" />];

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('renders sideBar opened', async () => {
    const { baseElement, getByText } = await act(() =>
      renderWithRouter(
        <Sidebar isOpen={true} onClose={vi.fn()}>
          {playlistMenuItems}
        </Sidebar>,
      ),
    );

    await act(() => vi.runAllTimers());

    expect(getByText('Home')).toBeVisible();
    expect(baseElement).toMatchSnapshot();
  });

  test('renders sideBar closed', async () => {
    const { baseElement, queryByText } = await act(() =>
      renderWithRouter(
        <Sidebar isOpen={false} onClose={vi.fn()}>
          {playlistMenuItems}
        </Sidebar>,
      ),
    );

    await act(() => vi.runAllTimers());

    expect(queryByText('Home')).toBeNull();
    expect(baseElement).toMatchSnapshot();
  });

  test('should add overflowY hidden on the body element when open', async () => {
    const onClose = vi.fn();
    const { container, rerender } = await act(() => renderWithRouter(<Sidebar isOpen={true} onClose={onClose} />));

    expect(container.parentNode).toHaveStyle({ overflowY: 'hidden' });

    act(() => rerender(<Sidebar isOpen={false} onClose={onClose} />));

    await act(() => vi.runAllTimers()); // wait for close animation

    expect(onClose).toHaveBeenCalled();
    expect(container.parentNode).not.toHaveStyle({ overflowY: 'hidden' });
  });
});
