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
import { PATH_ABOUT, PATH_CONTENT_LIST, PATH_LEGACY_SERIES, PATH_MEDIA, PATH_PLAYLIST, PATH_SEARCH, PATH_USER } from '@jwp/ott-common/src/paths';
import { APP_CONFIG_ITEM_TYPE } from '@jwp/ott-common/src/constants';
import AccountModal from '@jwp/ott-ui-react/src/containers/AccountModal/AccountModal';
import AccountModalRoute from '@jwp/ott-ui-react/src/containers/AccountModalRoute/AccountModalRoute';

import RoutesContainer from '#src/containers/RoutesContainer/RoutesContainer';

const Login = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/Login'));
const Registration = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/Registration'));
const PersonalDetails = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/PersonalDetails'));
const EditCard = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/EditCardDetails'));
const Checkout = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/Checkout'));
const Welcome = React.lazy(() => import('@jwp/ott-ui-react/src/components/Welcome/Welcome'));

const ChooseOffer = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/ChooseOffer'));
const ResetPassword = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/ResetPassword'));
const EditPassword = React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/EditPassword'));
const UpgradeSubscription = React.lazy(() => import('@jwp/ott-ui-react/src/components/UpgradeSubscription/UpgradeSubscription'));
const PaymentFailed = React.lazy(() => import('@jwp/ott-ui-react/src/components/PaymentFailed/PaymentFailed'));
const DeleteAccountModal = React.lazy(() => import('@jwp/ott-ui-react/src/components/DeleteAccountModal/DeleteAccountModal'));
const DeleteAccountPasswordWarning = React.lazy(() => import('@jwp/ott-ui-react/src/components/DeleteAccountPasswordWarning/DeleteAccountPasswordWarning'));
const UpdatePaymentMethod = React.lazy(() => import('@jwp/ott-ui-react/src/containers/UpdatePaymentMethod/UpdatePaymentMethod'));

export default function AppRoutes() {
  const { t } = useTranslation('error');

  return (
    <>
      <Routes>
        <Route element={<RoutesContainer />}>
          <Route element={<Layout />} errorElement={<RootErrorPage />}>
            <Route index element={<Home />} />
            <Route path={PATH_PLAYLIST} element={<PlaylistScreenRouter type={APP_CONFIG_ITEM_TYPE.playlist} />} />
            <Route path={PATH_CONTENT_LIST} element={<PlaylistScreenRouter type={APP_CONFIG_ITEM_TYPE.content_list} />} />
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
      <AccountModal>
        {/* public routes */}
        <AccountModalRoute param="login" element={<Login />} isPublic />
        <AccountModalRoute param="create-account" element={<Registration />} isPublic />
        {/* authenticated routes */}
        <AccountModalRoute param="personal-details" element={<PersonalDetails />} />
        <AccountModalRoute param="choose-offer" element={<ChooseOffer />} />
        <AccountModalRoute param="checkout" element={<Checkout />} />
        <AccountModalRoute param="welcome" element={<Welcome />} />

        <AccountModalRoute param="payment-error" element={<PaymentFailed type="error" message="todo" onCloseButtonClick={() => undefined} />} />
        <AccountModalRoute param="payment-error" element={<PaymentFailed type="error" message="todo" onCloseButtonClick={() => undefined} />} />

        <AccountModalRoute param="edit-card" element={<EditCard />} />

        <AccountModalRoute param="upgrade-subscription" element={<ChooseOffer />} />
        <AccountModalRoute param="upgrade-subscription-error" element={<UpgradeSubscription type="error" onCloseButtonClick={() => undefined} />} />
        <AccountModalRoute param="upgrade-subscription-success" element={<UpgradeSubscription type="success" onCloseButtonClick={() => undefined} />} />
        <AccountModalRoute param="upgrade-subscription-pending" element={<UpgradeSubscription type="pending" onCloseButtonClick={() => undefined} />} />

        <AccountModalRoute param="reset-password" element={<ResetPassword type="reset" />} />
        <AccountModalRoute param="forgot-password" element={<ResetPassword type="forgot" />} />
        <AccountModalRoute param="edit-password" element={<EditPassword />} />
        <AccountModalRoute param="send-confirmation" element={<ResetPassword type="confirmation" />} />
        <AccountModalRoute param="add-password" element={<EditPassword type="add" />} />

        <AccountModalRoute param="delete-account" element={<DeleteAccountModal />} />
        <AccountModalRoute param="delete-account-confirmation" element={<DeleteAccountModal />} />
        <AccountModalRoute param="warning-account-deletion" element={<DeleteAccountPasswordWarning />} />

        {/*<AccountModalRoute param="unsubscribe" element={} />*/}
        {/*<AccountModalRoute param="renew-subscription" element={} />*/}

        <AccountModalRoute param="payment-method" element={<UpdatePaymentMethod onCloseButtonClick={() => undefined} />} />
        <AccountModalRoute param="payment-method-success" element={<UpdatePaymentMethod onCloseButtonClick={() => undefined} />} />

        {/*<AccountModalRoute param="waiting-for-payment" element={} />*/}
        {/*<AccountModalRoute param="finalize-payment" element={} />*/}
      </AccountModal>
    </>
  );
}
