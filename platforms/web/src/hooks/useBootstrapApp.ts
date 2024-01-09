import { useRef } from 'react';
import { useQuery } from 'react-query';
import type { Config } from '@jwp/ott-common/types/config';
import type { Settings } from '@jwp/ott-common/types/settings';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AppController from '@jwp/ott-common/src/stores/AppController';
import type { AppError } from '@jwp/ott-common/src/utils/error';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';
import { setThemingVariables } from '@jwp/ott-ui-react/src/utils/theming';
import { addScript } from '@jwp/ott-ui-react/src/utils/dom';

import { useTrackConfigKeyChange } from './useTrackConfigKeyChange';

const applicationController = getModule(AppController);

type Resources = {
  config: Config;
  configSource: string | undefined;
  settings: Settings;
};

export const useBootstrapApp = (onReady: () => void) => {
  const analyticsLoadedRef = useRef(false);
  const { data, isLoading, error, isSuccess, refetch } = useQuery<Resources, AppError>(
    'config-init',
    () => applicationController.initializeApp(window.location.href),
    {
      refetchInterval: false,
      retry: 1,
      onSettled: async (data) => {
        // because theming and analytics are specific to web, we configure it from here
        // alternatively, we can use an events or specific callbacks or extend the AppController for each platform
        if (data?.config) {
          setThemingVariables(data?.config);
        }

        if (data?.config.analyticsToken && !analyticsLoadedRef.current) {
          await addScript('/jwpltx.js');
          analyticsLoadedRef.current = true;
        }
      },
      onSuccess: onReady,
      cacheTime: CACHE_TIME,
      staleTime: STALE_TIME,
    },
  );

  // Modify query string to add / remove app-config id
  useTrackConfigKeyChange(data?.settings, data?.configSource);

  return {
    data,
    isLoading,
    error,
    isSuccess,
    refetch,
  };
};

export type BootstrapData = ReturnType<typeof useBootstrapApp>;
