import React from 'react';
import { useTranslation } from 'react-i18next';
import Menu from '@jwp/ott-theme/assets/icons/menu.svg?react';

import Icon from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';

import styles from './Header.module.scss';

const HeaderMenu = ({ sideBarOpen, onClick }: { sideBarOpen: boolean; onClick: () => void }) => {
  const { t } = useTranslation('menu');

  return (
    <div className={styles.menu}>
      <IconButton className={styles.iconButton} aria-label={t('open_menu')} aria-expanded={sideBarOpen} onClick={onClick}>
        <Icon icon={Menu} />
      </IconButton>
    </div>
  );
};

export default HeaderMenu;
