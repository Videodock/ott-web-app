import { useQuery } from 'react-query';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { isLocked } from '@jwp/ott-common/src/utils/entitlements';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';

import useEntitlement from './useEntitlement';

const CACHE_TIME = 60 * 1000 * 20;

/**
 * @deprecated Use adScheduleUrls.xml form the config instead.
 */
const useLegacyStandaloneAds = ({ adScheduleId, enabled }: { adScheduleId: string | null | undefined; enabled: boolean }) => {
  const apiService = getModule(ApiService);

  const { isLoading, data } = useQuery(['ad-schedule', adScheduleId], async () => apiService.getAdSchedule(adScheduleId), {
    enabled: enabled && !!adScheduleId,
    cacheTime: CACHE_TIME,
    staleTime: CACHE_TIME,
  });

  return {
    isLoading,
    data,
  };
};

export const useAds = ({ item }: { item: PlaylistItem }) => {
  // data
  const { adSchedule: adScheduleId, adScheduleUrls, custom } = useConfigStore((s) => s.config);

  // disable for exclusive access
  const accessModel = useConfigStore((s) => s.accessModel);
  const subscription = useAccountStore((s) => s.subscription);
  const { isEntitled } = useEntitlement(item);
  // exclusive access means the item MUST be purchased to gain access (SVOD or TVOD)
  const exclusiveAccess = isEntitled && isLocked(accessModel, false, false, item);
  // the user has an active subscription
  const hasSubscription = accessModel === ACCESS_MODEL.SVOD && !!subscription;
  // disable ads when the user has exclusive access or an active subscription
  const disableAds = isTruthyCustomParamValue(custom?.['noAdForSubscribers']) && (exclusiveAccess || hasSubscription);

  // adScheduleUrls.xml prop exists when ad-config is attached to the App Config
  const useAppBasedFlow = !!adScheduleUrls?.xml;

  const { data: adSchedule, isLoading: isAdScheduleLoading } = useLegacyStandaloneAds({
    adScheduleId,
    enabled: !useAppBasedFlow,
  });
  const adConfig = {
    client: 'vast',
    schedule: createURL(adScheduleUrls?.xml || '', {
      media_id: item.mediaid,
    }),
  };

  if (disableAds) {
    return { isLoading: false, data: undefined };
  }

  return {
    isLoading: useAppBasedFlow ? false : isAdScheduleLoading,
    data: useAppBasedFlow ? adConfig : adSchedule,
  };
};
