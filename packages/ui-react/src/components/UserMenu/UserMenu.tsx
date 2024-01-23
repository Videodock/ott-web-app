import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { Profile } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import Favorite from '@jwp/ott-theme/assets/icons/favorite.svg?react';
import BalanceWallet from '@jwp/ott-theme/assets/icons/balance_wallet.svg?react';
import Exit from '@jwp/ott-theme/assets/icons/exit.svg?react';
import { PATH_USER_ACCOUNT, PATH_USER_FAVORITES, PATH_USER_PAYMENTS, PATH_USER_PROFILES_CREATE } from '@jwp/ott-common/src/paths';
import { userProfileURL } from '@jwp/ott-common/src/utils/urlFormatting';

import MenuButton from '../MenuButton/MenuButton';
import Icon from '../Icon/Icon';
import ProfileCircle from '../ProfileCircle/ProfileCircle';

import ProfilesMenu from './ProfilesMenu/ProfilesMenu';
import styles from './UserMenu.module.scss';

type Props = {
  small?: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
  currentProfile?: Profile | null;
  profilesEnabled?: boolean;
  profiles?: Profile[];
  isSelectingProfile?: boolean;
  selectProfile?: ({ id, avatarUrl }: { id: string; avatarUrl: string }) => void;
  favoritesEnabled?: boolean;
};

const UserMenu = ({
  showPaymentsItem,
  small = false,
  onClick,
  currentProfile,
  profilesEnabled,
  profiles,
  isSelectingProfile,
  selectProfile,
  favoritesEnabled,
}: Props) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const accountController = getModule(AccountController);

  const onLogout = useCallback(async () => {
    if (onClick) {
      onClick();
    }

    await accountController.logout();
    navigate('/', { replace: true });
  }, [onClick, navigate, accountController]);

  return (
    <ul className={styles.menuItems}>
      {profilesEnabled && selectProfile && (
        <ProfilesMenu
          profiles={profiles ?? []}
          currentProfile={currentProfile}
          small={small}
          selectingProfile={!!isSelectingProfile}
          selectProfile={selectProfile}
          createButtonLabel={t('nav.add_profile')}
          switchProfilesLabel={t('nav.switch_profiles')}
          onCreateButtonClick={() => navigate(PATH_USER_PROFILES_CREATE)}
        />
      )}
      <li className={styles.sectionHeader}>{t('nav.settings')}</li>
      {profilesEnabled && currentProfile && (
        <li>
          <MenuButton
            small={small}
            onClick={onClick}
            to={userProfileURL(currentProfile.id ?? '')}
            label={t('nav.profile')}
            startIcon={<ProfileCircle src={currentProfile?.avatar_url} alt={currentProfile?.name ?? ''} />}
          />
        </li>
      )}
      <li>
        <MenuButton small={small} onClick={onClick} to={PATH_USER_ACCOUNT} label={t('nav.account')} startIcon={<Icon icon={AccountCircle} />} />
      </li>

      {favoritesEnabled && (
        <li>
          <MenuButton small={small} onClick={onClick} to={PATH_USER_FAVORITES} label={t('nav.favorites')} startIcon={<Icon icon={Favorite} />} />
        </li>
      )}
      {showPaymentsItem && (
        <li>
          <MenuButton small={small} onClick={onClick} to={PATH_USER_PAYMENTS} label={t('nav.payments')} startIcon={<Icon icon={BalanceWallet} />} />
        </li>
      )}
      <li>
        <hr className={classNames(styles.divider, { [styles.small]: small })} />
      </li>
      <li>
        <MenuButton small={small} onClick={onLogout} label={t('nav.logout')} startIcon={<Icon icon={Exit} />} />
      </li>
    </ul>
  );
};

export default UserMenu;
