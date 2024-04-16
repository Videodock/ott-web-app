import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

const HeaderSkipLink = () => {
  const { t } = useTranslation('menu');
  return (
    <a href="#content" className={styles.skipToContent}>
      {t('skip_to_content')}
    </a>
  );
};

export default HeaderSkipLink;
