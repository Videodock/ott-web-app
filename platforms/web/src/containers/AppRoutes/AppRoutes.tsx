import React from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import ErrorPage from '@jwp/ott-ui-react/src/components/ErrorPage/ErrorPage';
import RootErrorPage from '@jwp/ott-ui-react/src/components/RootErrorPage/RootErrorPage';
import About from '@jwp/ott-ui-react/src/pages/About/About';
import Home from '@jwp/ott-ui-react/src/pages/Home/Home';
import Search from '@jwp/ott-ui-react/src/pages/Search/Search';
import User from '@jwp/ott-ui-react/src/pages/User/User';
import LegacySeries from '@jwp/ott-ui-react/src/pages/LegacySeries/LegacySeries';
import MediaScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '@jwp/ott-ui-react/src/containers/Layout/Layout';
import Profiles from '@jwp/ott-ui-react/src/containers/Profiles/Profiles';
import CreateProfile from '@jwp/ott-ui-react/src/containers/Profiles/CreateProfile';
import EditProfile from '@jwp/ott-ui-react/src/containers/Profiles/EditProfile';
import {
  PATH_ABOUT,
  PATH_LEGACY_SERIES,
  PATH_MEDIA,
  PATH_PLAYLIST,
  PATH_SEARCH,
  PATH_USER,
  PATH_USER_PROFILES,
  PATH_USER_PROFILES_CREATE,
  PATH_USER_PROFILES_EDIT,
  PATH_USER_PROFILES_EDIT_PROFILE,
} from '@jwp/ott-common/src/paths';

import RoutesContainer from '#src/containers/RoutesContainer/RoutesContainer';

export default function AppRoutes() {
  const { t } = useTranslation('error');

  return (
    <Routes>
      <Route element={<RoutesContainer />}>
        <Route path={PATH_USER_PROFILES} element={<Profiles />} />
        <Route path={PATH_USER_PROFILES_CREATE} element={<CreateProfile />} />
        <Route path={PATH_USER_PROFILES_EDIT} element={<Profiles editMode />} />
        <Route path={PATH_USER_PROFILES_EDIT_PROFILE} element={<EditProfile />} />
        <Route element={<Layout />} errorElement={<RootErrorPage />}>
          <Route index element={<Home />} />
          <Route path={PATH_PLAYLIST} element={<PlaylistScreenRouter />} />
          <Route path={PATH_MEDIA} element={<MediaScreenRouter />} />
          <Route path={PATH_LEGACY_SERIES} element={<LegacySeries />} />
          <Route path={PATH_SEARCH} element={<Search />} />
          <Route path={PATH_USER} element={<User />} />
          <Route path={PATH_ABOUT} element={<About />} />
          <Route
            path="/*"
            element={<ErrorPage title={t('notfound_error_heading', 'Not found')} message={t('notfound_error_description', "This page doesn't exist.")} />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
