import React, { isValidElement, type PropsWithChildren, Suspense, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { createURLFromLocation, modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';

import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Dialog from '../../components/Dialog/Dialog';

import styles from './AccountModal.module.scss';

export type AccountModals = {
  login: 'login';
  'create-account': 'create-account';
  'personal-details': 'personal-details';
  'choose-offer': 'choose-offer';
  'edit-card': 'edit-card';
  'upgrade-subscription': 'upgrade-subscription';
  'upgrade-subscription-error': 'upgrade-subscription-error';
  'upgrade-subscription-success': 'upgrade-subscription-success';
  'upgrade-subscription-pending': 'upgrade-subscription-pending';
  checkout: 'checkout';
  'payment-error': 'payment-error';
  'payment-cancelled': 'payment-cancelled';
  welcome: 'welcome';
  'reset-password': 'reset-password';
  'forgot-password': 'forgot-password';
  'add-password': 'add-password';
  'delete-account': 'delete-account';
  'delete-account-confirmation': 'delete-account-confirmation';
  'warning-account-deletion': 'warning-account-deletion';
  'send-confirmation': 'send-confirmation';
  'edit-password': 'edit-password';
  unsubscribe: 'unsubscribe';
  'renew-subscription': 'renew-subscription';
  'payment-method': 'payment-method';
  'payment-method-success': 'payment-method-success';
  'waiting-for-payment': 'waiting-for-payment';
  'finalize-payment': 'finalize-payment';
};

const AccountModal = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewParam = useQueryParam('u');
  const viewParamRef = useRef(viewParam);
  const { loading, user } = useAccountStore(({ loading, user }) => ({ loading, user }), shallow);
  const config = useConfigStore((s) => s.config);
  const {
    assets: { banner },
  } = config;

  const toLogin = useEventCallback(() => {
    navigate(modalURLFromLocation(location, 'login'));
  });

  // make sure the last view is rendered even when the modal gets closed
  const view = useMemo(() => {
    if (viewParam) viewParamRef.current = viewParam;
    return viewParamRef.current;
  }, [viewParam]);

  const modals = useMemo(() => {
    return (
      React.Children.map(children, (child) => {
        if (!isValidElement(child) || !('param' in child.props) || !('element' in child.props)) {
          throw new Error('<AccountModalRoute /> component expected as children');
        }

        return {
          param: child.props.param,
          element: child.props.element,
          isPublic: !!child.props.isPublic,
          hideBanner: false,
          size: 'small' as const,
        };
      }) || []
    );
  }, [children]);

  const currentModal = useMemo(() => modals.find(({ param }) => param === view), [modals, view]);
  const isPublicView = !!currentModal?.isPublic;
  const shouldShowBanner = !currentModal?.hideBanner;
  const dialogSize = currentModal?.size || 'small';

  useEffect(() => {
    if (!!viewParam && !loading && !user && !isPublicView) {
      toLogin();
    }
  }, [viewParam, loading, isPublicView, user, toLogin]);

  const closeHandler = useEventCallback(() => {
    navigate(createURLFromLocation(location, { u: null, message: null }));
  });

  const fallback = (
    <div style={{ height: 300 }}>
      <LoadingOverlay inline />
    </div>
  );

  const renderForm = () => {
    if (!user && loading && !isPublicView) {
      return fallback;
    }

    if (!currentModal) return null;

    return currentModal.element;
  };

  return (
    <Dialog size={dialogSize} open={!!viewParam} onClose={closeHandler}>
      {shouldShowBanner && banner && (
        <div className={styles.banner}>
          <img src={banner} alt="" />
        </div>
      )}
      <Suspense fallback={fallback}>{renderForm()}</Suspense>
      {children}
    </Dialog>
  );
};

export default AccountModal;
