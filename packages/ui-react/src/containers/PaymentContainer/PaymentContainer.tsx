import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';
import { useSubscriptionChange } from '@jwp/ott-hooks-react/src/useSubscriptionChange';

import styles from '../../pages/User/User.module.scss';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Payment from '../../components/Payment/Payment';
import { modalURL } from '../../utils/location';

/**
 * Handles billing receipts by either downloading the receipt directly if it is an instance of Blob,
 * or opening it in a new window if it is a string representation.
 *
 * @param {Blob | string} receipt - The billing receipt data. If a Blob, it will be downloaded; if a string,
 * it will be treated as an HTML representation and opened in a new window.
 * @param {string} transactionId - The unique identifier for the transaction associated with the receipt.
 *
 * @returns {void}
 *
 */
export const processBillingReceipt = (receipt: Blob | string, transactionId: string) => {
  if (receipt instanceof Blob) {
    const url = window.URL.createObjectURL(new Blob([receipt]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${transactionId}.pdf`);
    document.body.appendChild(link);
    link.click();
  } else {
    const newWindow = window.open('', `Receipt ${transactionId}`, '');
    const htmlString = window.atob(receipt as unknown as string);

    if (newWindow) {
      newWindow.opener = null;
      newWindow.document.write(htmlString);
      newWindow.document.close();
    }
  }
};

const PaymentContainer = () => {
  const accountController = getModule(AccountController);

  const { accessModel } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config.features?.favoritesList,
    }),
    shallow,
  );
  const navigate = useNavigate();

  const { user: customer, subscription: activeSubscription, transactions, activePayment, pendingOffer, loading } = useAccountStore();
  const { canUpdatePaymentMethod, canShowReceipts, canRenewSubscription } = accountController.getFeatures();

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(activeSubscription?.accessFeeId ?? null);
  const [isUpgradeOffer, setIsUpgradeOffer] = useState<boolean | undefined>(undefined);

  const { offerSwitches } = useCheckoutStore();
  const location = useLocation();

  const handleUpgradeSubscriptionClick = async () => {
    navigate(modalURL(location, 'upgrade-subscription'));
  };

  const handleShowReceiptClick = async (transactionId: string) => {
    setIsLoadingReceipt(true);

    try {
      const receipt = await accountController.getReceipt(transactionId);
      if (receipt) {
        processBillingReceipt(receipt, transactionId);
      }
    } catch (error: unknown) {
      throw new Error("Couldn't parse receipt. " + (error instanceof Error ? error.message : ''));
    }

    setIsLoadingReceipt(false);
  };

  const { offers } = useOffers();

  const changeSubscriptionPlan = useSubscriptionChange(isUpgradeOffer ?? false, selectedOfferId, customer, activeSubscription?.subscriptionId);

  const onChangePlanClick = async () => {
    if (selectedOfferId && activeSubscription?.subscriptionId) {
      changeSubscriptionPlan.mutate({
        accessFeeId: selectedOfferId.slice(1),
        subscriptionId: `${activeSubscription.subscriptionId}`,
      });
    }
  };

  if (!customer) {
    return <LoadingOverlay />;
  }

  const pendingDowngradeOfferId = (customer.metadata?.[`${activeSubscription?.subscriptionId}_pending_downgrade`] as string) || '';

  return (
    <Payment
      accessModel={accessModel}
      activeSubscription={activeSubscription}
      activePaymentDetail={activePayment}
      transactions={transactions}
      customer={customer}
      pendingOffer={pendingOffer}
      isLoading={loading || isLoadingReceipt}
      panelClassName={styles.panel}
      panelHeaderClassName={styles.panelHeader}
      onShowAllTransactionsClick={() => setShowAllTransactions(true)}
      showAllTransactions={showAllTransactions}
      canUpdatePaymentMethod={canUpdatePaymentMethod}
      canRenewSubscription={canRenewSubscription}
      onUpgradeSubscriptionClick={handleUpgradeSubscriptionClick}
      offerSwitchesAvailable={!!offerSwitches.length}
      canShowReceipts={canShowReceipts}
      onShowReceiptClick={handleShowReceiptClick}
      offers={offers}
      pendingDowngradeOfferId={pendingDowngradeOfferId}
      changeSubscriptionPlan={changeSubscriptionPlan}
      onChangePlanClick={onChangePlanClick}
      selectedOfferId={selectedOfferId}
      setSelectedOfferId={(offerId: string | null) => setSelectedOfferId(offerId)}
      isUpgradeOffer={isUpgradeOffer}
      setIsUpgradeOffer={(isUpgradeOffer: boolean | undefined) => setIsUpgradeOffer(isUpgradeOffer)}
    />
  );
};

export default PaymentContainer;
