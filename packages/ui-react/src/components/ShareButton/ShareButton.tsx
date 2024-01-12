import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '@jwp/ott-common/src/utils/dom';
import useBreakpoint, { Breakpoint } from '@jwp/ott-hooks-react/src/useBreakpoint';
import Check from '@jwp/ott-theme/assets/icons/check.svg?react';
import Share from '@jwp/ott-theme/assets/icons/share.svg?react';

import Button from '../Button/Button';
import Icon from '../Icon/Icon';

type Props = {
  title: string;
  description: string;
  url: string;
};

const ShareButton = ({ title, description, url }: Props) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const [hasShared, setHasShared] = useState<boolean>(false);

  const onShareClick = async () => {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, text: description, url });
      return;
    }

    copyToClipboard(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };

  return (
    <Button
      label={hasShared ? t('video:copied_url') : t('video:share')}
      startIcon={hasShared ? <Icon icon={Check} /> : <Icon icon={Share} />}
      onClick={onShareClick}
      active={hasShared}
      fullWidth={breakpoint < Breakpoint.md}
    />
  );
};

export default ShareButton;
