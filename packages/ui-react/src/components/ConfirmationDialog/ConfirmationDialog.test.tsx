import React from 'react';

import { renderWithRouter } from '../../../test/utils';

import ConfirmationDialog from './ConfirmationDialog';

describe('<ConfirmationDialog>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(<ConfirmationDialog body="Body" title="Title" open={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(container).toMatchSnapshot();
  });
});
