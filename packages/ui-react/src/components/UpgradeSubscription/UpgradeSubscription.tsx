import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import { AriaAnnouncerVariant, useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';

import styles from './UpgradeSubscription.module.scss';

type Props = {
  type: 'error' | 'success' | 'pending';
  onCloseButtonClick: () => void;
};

const UpgradeSubscription: React.FC<Props> = ({ type, onCloseButtonClick }: Props) => {
  const { t } = useTranslation('account');
  const announcer = useAriaAnnouncer();

  // these comments exist for extracting dynamic i18n keys
  // t('account:checkout.upgrade_success');
  // t('account:checkout.upgrade_success_message');
  // t('account:checkout.upgrade_pending');
  // t('account:checkout.upgrade_pending_message');
  // t('account:checkout.upgrade_error');
  // t('account:checkout.upgrade_error_message');
  const title = t(`checkout.upgrade_${type}`);
  const message = t(`checkout.upgrade_${type}_message`);

  const typeToAnnounce: Record<Props['type'], AriaAnnouncerVariant> = useMemo(
    () => ({
      error: 'error',
      success: 'success',
      pending: 'info',
    }),
    [],
  );

  useEffect(() => {
    announcer(message, typeToAnnounce[type]);
  }, [announcer, message, type, typeToAnnounce]);

  return (
    <div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <div>
        <Button label={t('checkout.close')} onClick={onCloseButtonClick} color="primary" variant="contained" size="large" fullWidth />
      </div>
    </div>
  );
};

export default UpgradeSubscription;
