import React from 'react';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '../../../test/utils';

import UserMenu from './UserMenu';

describe('<UserMenu>', () => {
  test('renders and matches snapshot', () => {
    const { container } = renderWithRouter(
      <UserMenu
        open={false}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        favoritesEnabled
        isLoggedIn
        onLoginButtonClick={vi.fn()}
        onSelectProfile={vi.fn()}
        profile={null}
        onSignUpButtonClick={vi.fn()}
        profilesEnabled={true}
        profileLoading={false}
        profiles={[]}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  test('WCAG 2.1 (AA) compliant', async () => {
    const { container } = renderWithRouter(
      <UserMenu
        open={false}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        favoritesEnabled
        isLoggedIn
        onLoginButtonClick={vi.fn()}
        onSelectProfile={vi.fn()}
        profile={null}
        onSignUpButtonClick={vi.fn()}
        profilesEnabled={true}
        profileLoading={false}
        profiles={[]}
      />,
    );

    expect(await axe(container, { runOnly: ['wcag21a', 'wcag21aa'] })).toHaveNoViolations();
  });
});
