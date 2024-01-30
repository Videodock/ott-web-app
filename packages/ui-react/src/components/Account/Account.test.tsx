import React from 'react';
import type { CustomFormField } from '@jwp/ott-common/types/account';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import customer from '@jwp/ott-testing/fixtures/customer.json';
import { mockService } from '@jwp/ott-common/test/mockService';
import { DEFAULT_FEATURES } from '@jwp/ott-common/src/constants';

import { renderWithRouter } from '../../../test/utils';

import Account from './Account';

describe('<Account>', () => {
  beforeEach(() => {
    // TODO: remove AccountController from component
    mockService(AccountController, { getFeatures: () => DEFAULT_FEATURES });
  });

  test('renders and matches snapshot', () => {
    useAccountStore.setState({
      user: customer,
      publisherConsents: Array.of({ name: 'marketing', label: 'Receive Marketing Emails' } as CustomFormField),
    });

    const { container } = renderWithRouter(<Account panelClassName={'panel-class'} panelHeaderClassName={'header-class'} canUpdateEmail={true} />);

    // todo
    expect(container).toMatchSnapshot();
  });
});
