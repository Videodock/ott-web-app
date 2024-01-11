import { useQuery } from 'react-query';
import type { Config } from '@jwp/ott-common/types/config';
import type { Settings } from '@jwp/ott-common/types/settings';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AppController from '@jwp/ott-common/src/stores/AppController';
import type { AppError } from '@jwp/ott-common/src/utils/error';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';

const applicationController = getModule(AppController);

type Resources = {
  config: Config;
  configSource: string | undefined;
  settings: Settings;
};

export type OnReadyCallback = (config: Config | undefined) => void;

export const useBootstrapApp = (url: string, onReady: OnReadyCallback) => {
  const { data, isLoading, error, isSuccess, refetch } = useQuery<Resources, AppError>('config-init', () => applicationController.initializeApp(url), {
    refetchInterval: false,
    retry: 1,
    onSettled: (query) => onReady(query?.config),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  return {
    data,
    isLoading,
    error,
    isSuccess,
    refetch,
  };
};

export type BootstrapData = ReturnType<typeof useBootstrapApp>;
