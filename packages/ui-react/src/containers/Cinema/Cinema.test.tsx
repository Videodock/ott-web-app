import React from 'react';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { beforeEach } from 'vitest';
import { mockService } from '@jwp/ott-common/test/mockService';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import GenericEntitlementService from '@jwp/ott-common/src/services/GenericEntitlementService';
import JWPEntitlementService from '@jwp/ott-common/src/services/JWPEntitlementService';
import WatchHistoryController from '@jwp/ott-common/src/stores/WatchHistoryController';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';

import { renderWithRouter } from '../../../test/utils';

import Cinema from './Cinema';

describe('<Cinema>', () => {
  beforeEach(() => {
    mockService(ApiService, {});
    mockService(CheckoutController, {});
    mockService(GenericEntitlementService, {});
    mockService(JWPEntitlementService, {});
    mockService(WatchHistoryController, {});
  });

  test('renders and matches snapshot', () => {
    const item = {
      description: 'Test item description',
      duration: 354,
      feedid: 'ax85aa',
      image: 'http://test/img.jpg',
      images: [],
      link: 'http://test/link',
      genre: 'Tester',
      mediaid: 'zp50pz',
      pubdate: 26092021,
      rating: 'CC_CC',
      sources: [],
      seriesId: 'ag94ag',
      tags: 'Test tag',
      title: 'Test item title',
      tracks: [],
    } as PlaylistItem;

    const { container } = renderWithRouter(
      <Cinema item={item} onPlay={() => null} onPause={() => null} open={true} title={item.title} primaryMetadata="Primary metadata" />,
    );

    expect(container).toMatchSnapshot();
  });
});
