import React from 'react';
import { axe } from 'vitest-axe';
import ProfileController from '@jwp/ott-common/src/controllers/ProfileController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import Layout from './Layout';

describe('<Layout />', () => {
  beforeEach(() => {
    mockService(ProfileController, { isEnabled: vi.fn().mockReturnValue(false) });
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders layout', () => {
    const { container } = renderWithRouter(<Layout />);

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.1 (AA) compliant', async () => {
    const { container } = renderWithRouter(<Layout />);

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa'] })).toHaveNoViolations();
  });
});
