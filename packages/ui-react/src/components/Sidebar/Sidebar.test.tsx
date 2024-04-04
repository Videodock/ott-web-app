import React from 'react';

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

  test('renders sideBar opened', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });

  test('renders sideBar closed', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={false} onClose={vi.fn()}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(container).toMatchSnapshot();
  });

  test('sets inert on the given containerRef', () => {
    const ref = {
      current: document.createElement('div'),
    };
    const { rerender } = renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()} containerRef={ref}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(ref.current).toHaveProperty('inert', true);

    rerender(
      <Sidebar isOpen={false} onClose={vi.fn()} containerRef={ref}>
        {playlistMenuItems}
      </Sidebar>,
    );

    expect(ref.current).toHaveProperty('inert', false);
  });

  test('should add overflowY hidden on the body element when open', () => {
    const { container, rerender } = renderWithRouter(<Sidebar isOpen={true} onClose={vi.fn()} />);

    expect(container.parentNode).toHaveStyle({ overflowY: 'hidden' });

    rerender(<Sidebar isOpen={false} onClose={vi.fn()} />);

    expect(container.parentNode).not.toHaveStyle({ overflowY: 'hidden' });
  });

  test('should focus the first interactive element in the sidebar when opened', () => {
    const { getByLabelText, rerender } = renderWithRouter(
      <Sidebar isOpen={false} onClose={vi.fn()}>
        <button>close</button>
      </Sidebar>,
    );

    expect(document.activeElement).toBe(document.body);

    rerender(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        <button>close</button>
      </Sidebar>,
    );
    vi.runAllTimers();

    expect(document.activeElement).toBe(getByLabelText('close_menu'));
  });

  test('should focus the last focused element when the sidebar is closed', () => {
    const { getByText, rerender } = renderWithRouter(
      <>
        <button>open</button>
        <Sidebar isOpen={false} onClose={vi.fn()}>
          <button>close</button>
        </Sidebar>
      </>,
    );
    getByText('open').focus();
    rerender(
      <>
        <button>open</button>
        <Sidebar isOpen={true} onClose={vi.fn()}>
          <button>close</button>
        </Sidebar>
      </>,
    );
    vi.runAllTimers();

    rerender(
      <>
        <button>open</button>
        <Sidebar isOpen={false} onClose={vi.fn()}>
          <button>close</button>
        </Sidebar>
      </>,
    );
    vi.runAllTimers();

    expect(document.activeElement).toBe(getByText('open'));
  });
});
