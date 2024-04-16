import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '../Logo/Logo';

import styles from './Header.module.scss';

type Props = {
  siteName?: string;
  logoSrc?: string | null;
  setLogoLoaded: (loaded: boolean) => void;
};

const HeaderBrand = ({ siteName, logoSrc, setLogoLoaded }: Props) => {
  const { t } = useTranslation('menu');

  if (!logoSrc) return null;

  return (
    <div className={styles.brand}>
      <Logo alt={t('logo_alt', { siteName })} src={logoSrc} onLoad={() => setLogoLoaded(true)} />
    </div>
  );
};

export default HeaderBrand;
