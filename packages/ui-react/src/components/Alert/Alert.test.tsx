import React from 'react';

import { renderWithRouter } from '../../../test/utils';

import Alert from './Alert';

describe('<Alert>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<Alert message="Body" open={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
