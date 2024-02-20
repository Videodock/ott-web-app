import { useMutation } from 'react-query';
import { useEffect } from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import type { OfferType } from '@jwp/ott-common/types/checkout';

const useOffers = () => {
  const checkoutController = getModule(CheckoutController);
  const accountController = getModule(AccountController);

  const { offersMedia, offersSubscription, offersSwitchSubscription, requestedMediaOffers } = useCheckoutStore(
    ({ offersMedia, offersSubscription, offersSwitchSubscription, requestedMediaOffers }) => ({
      offersMedia,
      offersSubscription,
      offersSwitchSubscription,
      requestedMediaOffers,
    }),
    shallow,
  );

  const { mutate: initialise, isLoading: isInitialisationLoading } = useMutation<void>({
    mutationKey: ['initialiseOffers', requestedMediaOffers],
    mutationFn: checkoutController.initialiseOffers,
  });

  const chooseOffer = useMutation({
    mutationKey: ['chooseOffer'],
    mutationFn: checkoutController.chooseOffer,
  });

  const switchSubscription = useMutation({
    mutationKey: ['switchSubscription'],
    mutationFn: checkoutController.switchSubscription,
    onSuccess: () => accountController.reloadSubscriptions({ delay: 7500 }), // @todo: Is there a better way to wait?
  });

  useEffect(() => {
    initialise();
  }, [requestedMediaOffers, initialise]);

  const hasMediaOffers = offersMedia.length > 0;
  const hasSubscriptionOffers = offersSubscription.length > 0;
  const hasPremierOffers = requestedMediaOffers.some((mediaOffer) => mediaOffer.premier);
  const hasMultipleOfferTypes = (offersSubscription.length > 0 || offersSwitchSubscription.length > 0) && hasMediaOffers && !hasPremierOffers;
  const defaultOfferType: OfferType = hasPremierOffers || !hasSubscriptionOffers ? 'tvod' : 'svod';

  return {
    isLoading: isInitialisationLoading || chooseOffer.isLoading,
    offersMedia,
    offersSubscription,
    offersSwitchSubscription,
    chooseOffer,
    switchSubscription,
    hasMultipleOfferTypes,
    defaultOfferType,
  };
};

export default useOffers;
