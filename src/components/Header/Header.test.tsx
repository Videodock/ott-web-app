import React from 'react';

import { render } from '../../testUtils';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    const { container } = render(<Header />);

    expect(container).toMatchSnapshot();
  });
});
