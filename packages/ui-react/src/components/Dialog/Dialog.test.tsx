import React from 'react';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';

import Dialog from './Dialog';

describe('<Dialog>', () => {
  test('renders and matches snapshot', () => {
    const { baseElement } = renderWithRouter(
      <>
        <span>Some content</span>
        <Dialog onClose={vi.fn()} open={true}>
          Dialog contents
        </Dialog>
        <span>Some other content</span>
      </>,
    );

    expect(baseElement).toMatchSnapshot();
  });

  test('Should ensure Dialog is properly marked as a modal and has role "dialog"', () => {
    const { getByTestId } = render(
      <>
        <span>Some content</span>
        <Dialog onClose={vi.fn()} open={true} role="dialog" data-testid="dialog">
          Dialog contents
        </Dialog>
        <span>Some other content</span>
      </>,
    );

    const dialogElement = getByTestId('dialog');

    expect(dialogElement).toHaveAttribute('aria-modal', 'true');
    expect(dialogElement).toHaveAttribute('role', 'dialog');
  });

  test('WCAG 2.2 (AA) compliant', async () => {
    const { container } = render(
      <Dialog onClose={vi.fn()} open={true} role="dialog">
        Dialog contents
      </Dialog>,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa', 'wcag22aa'] })).toHaveNoViolations();
  });
});
