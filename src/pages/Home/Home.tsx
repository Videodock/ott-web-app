import React from 'react';
import shallow from 'zustand/shallow';
import { useTranslation } from 'react-i18next';

import { useConfigStore } from '#src/stores/ConfigStore';
import type { Content } from '#types/Config';
import ShelfList from '#src/containers/ShelfList/ShelfList';
import '../../styles/accessibility.scss';

const Home = () => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const content: Content[] = config?.content;
  const { t } = useTranslation('common');

  return (
    <>
      <h1 className="hideUntilFocus">{t('home')}</h1>
      <ShelfList rows={content} />
    </>
  );
};

export default Home;
