import React from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Content } from '@jwp/ott-common/types/config';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useTranslation } from 'react-i18next';

import styles from './Home.module.scss';

import ShelfList from '../../containers/ShelfList/ShelfList';

const Home = () => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const content: Content[] = config?.content;
  const { t } = useTranslation('common');

  return (
    <>
      <h1 className={styles.hideUntilFocus}>{t('home')}</h1>
      <ShelfList rows={content} />
    </>
  );
};

export default Home;
