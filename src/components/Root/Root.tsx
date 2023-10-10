import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_PREVIEW_MODE } from '#src/utils/common';
import AppRoutes from '#src/containers/AppRoutes/AppRoutes';
import registerCustomScreens from '#src/screenMapping';
import { getModule } from '#src/modules/container';
import ApplicationController from '#src/stores/ApplicationController';

const applicationController = getModule(ApplicationController);

const Root: FC = () => {
  const { t } = useTranslation('error');

  const bootstrapQuery = useQuery('config', async () => applicationController.bootstrap(), {
    retry: 3,
  });

  // Register custom screen mappings
  useEffect(() => {
    registerCustomScreens();
  }, []);

  // const userData = useAccountStore((s) => ({ loading: s.loading, user: s.user }));
  //
  // const { profile, selectingProfileAvatar } = useProfileStore();
  //
  // if (userData.user && selectingProfileAvatar !== null) {
  //   return <LoadingOverlay profileImageUrl={selectingProfileAvatar || profile?.avatar_url} />;
  // }
  //
  // if (userData.user && !userData.loading && window.location.href.includes('#token')) {
  //   return <Navigate to="/" />; // component instead of hook to prevent extra re-renders
  // }

  const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

  // if (settingsQuery.isError) {
  //   return (
  //     <ErrorPage
  //       title={t('settings_invalid')}
  //       message={t('check_your_settings')}
  //       error={settingsQuery.error as Error}
  //       helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/initialization-file.md'}
  //     />
  //   );
  // }

  console.log(bootstrapQuery.isFetched);

  return (
    <>
      {!bootstrapQuery.isError && !bootstrapQuery.isLoading && bootstrapQuery.isFetched && <AppRoutes />}
      {/*Show the error page when error except in demo mode (the demo mode shows its own error)*/}
      {bootstrapQuery.isError && !IS_DEMO_OR_PREVIEW && (
        <ErrorPage
          title={t('config_invalid')}
          message={t('check_your_config')}
          error={bootstrapQuery.error as Error}
          helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md'}
        />
      )}
      {/*{IS_DEMO_OR_PREVIEW && <DemoConfigDialog selectedConfigSource={configSource} configQuery={configQuery} />}*/}
      {bootstrapQuery.isFetched && <AccountModal />}
      {/* Config select control to improve testing experience */}
      {/*{((IS_DEVELOPMENT_BUILD && !IS_TEST_MODE) || IS_PREVIEW_MODE) && <DevConfigSelector selectedConfig={configSource} />}*/}
    </>
  );
};

export default Root;
