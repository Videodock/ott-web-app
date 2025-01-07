import React from 'react';

type ModalDef = {
  key: string;
  component: React.ReactNode;
  public?: boolean;
  hideBanner?: boolean;
  size?: 'large' | 'small';
};

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

const closeModal = () => {
  // todo
  console.warn('Close modal should be moved to component...');
};

const accountModals: ModalDef[] = [
  {
    key: 'login',
    public: true,
    component: <Login />,
  },
  {
    key: 'create-account',
    public: true,
    component: <Registration />,
  },
  {
    key: 'personal-details',
    component: <PersonalDetails />,
  },
  { key: 'choose-offer', component: <ChooseOffer /> },
  {
    key: 'edit-card',
    hideBanner: true,
    component: <EditCard />,
  },
  {
    key: 'checkout',
    component: <Checkout />,
  },
  { key: 'welcome', component: <Welcome /> },

  { key: 'upgrade-subscription', component: <ChooseOffer /> },
  {
    key: 'upgrade-subscription-error',
    component: <UpgradeSubscription type="error" onCloseButtonClick={closeModal} />,
  },
  {
    key: 'upgrade-subscription-success',
    component: <UpgradeSubscription type="success" onCloseButtonClick={closeModal} />,
  },
  {
    key: 'upgrade-subscription-pending',
    component: <UpgradeSubscription type="pending" onCloseButtonClick={closeModal} />,
  },

  {
    key: 'payment-error',
    component: <PaymentFailed type="error" message="asd" onCloseButtonClick={closeModal} />,
  },
  {
    key: 'payment-cancelled',
    component: <PaymentFailed type="cancelled" message="asd" onCloseButtonClick={closeModal} />,
  },

  { key: 'reset-password', public: true, component: <ResetPassword type="reset" /> },
  { key: 'forgot-password', public: true, component: <ResetPassword type="forgot" /> },
  { key: 'edit-password', public: true, component: <EditPassword /> },
  { key: 'send-confirmation', public: true, component: <ResetPassword type="confirmation" /> },
  { key: 'add-password', component: <EditPassword type="add" /> },

  { key: 'delete-account', hideBanner: true, component: <DeleteAccountModal /> },
  { key: 'delete-account-confirmation', hideBanner: true, size: 'large', component: <DeleteAccountModal /> },
  { key: 'warning-account-deletion', hideBanner: true, component: <DeleteAccountPasswordWarning /> },

  // {
  //   key: 'unsubscribe',
  //   component: React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/CancelSubscription')),
  // },
  // {
  //   key: 'renew-subscription',
  //   component: React.lazy(() => import('@jwp/ott-ui-react/src/containers/AccountModal/forms/RenewSubscription')),
  // },

  { key: 'payment-method', component: <UpdatePaymentMethod onCloseButtonClick={closeModal} /> },
  { key: 'payment-method-success', component: <UpdatePaymentMethod onCloseButtonClick={closeModal} /> },
  // {
  //   key: 'waiting-for-payment',
  //   component: React.lazy(() => import('@jwp/ott-ui-react/src/components/WaitingForPayment/WaitingForPayment')),
  // },
  // {
  //   key: 'finalize-payment',
  //   component: React.lazy(() => import('@jwp/ott-ui-react/src/components/FinalizePayment/FinalizePayment')),
  // },
];

export default accountModals;
