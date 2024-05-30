import React from 'react';

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
});
