import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { Profile } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/stores/AccountController';

import AccountCircle from '../../icons/AccountCircle';
import Favorite from '../../icons/Favorite';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import ProfileCircle from '../../icons/ProfileCircle';
import MenuButton from '../MenuButton/MenuButton';

import ProfilesMenu from './ProfilesMenu/ProfilesMenu';
import styles from './UserMenu.module.scss';

type Props = {
  small?: boolean;
  focusable: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
  onFocus,
  onBlur,
  currentProfile,
  profilesEnabled,
  profiles,
  isSelectingProfile,
  selectProfile,
  favoritesEnabled,
  focusable,
}: Props) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const accountController = getModule(AccountController);
  const tabIndex = focusable ? 0 : -1;

  const onLogout = useCallback(async () => {
    if (onClick) {
      onClick();
    }

    await accountController.logout();
    navigate('/', { replace: true });
  }, [onClick, navigate, accountController]);

  return (
    <ul onFocus={onFocus} onBlur={onBlur} className={styles.menuItems}>
      {profilesEnabled && selectProfile && (
        <ProfilesMenu
          profiles={profiles ?? []}
          currentProfile={currentProfile}
          small={small}
          selectingProfile={!!isSelectingProfile}
          selectProfile={selectProfile}
          createButtonLabel={t('nav.add_profile')}
          switchProfilesLabel={t('nav.switch_profiles')}
          onCreateButtonClick={() => navigate('/u/profiles/create')}
        />
      )}
      <li className={styles.sectionHeader}>{t('nav.settings')}</li>
      {profilesEnabled && currentProfile && (
        <li>
          <MenuButton
            small={small}
            onClick={onClick}
            to={`/u/my-profile/${currentProfile?.id ?? ''}`}
            label={t('nav.profile')}
            tabIndex={tabIndex}
            startIcon={<ProfileCircle src={currentProfile?.avatar_url} alt={currentProfile?.name ?? ''} />}
          />
        </li>
      )}
      <li>
        <MenuButton small={small} onClick={onClick} to="/u/my-account" label={t('nav.account')} startIcon={<AccountCircle />} tabIndex={tabIndex} />
      </li>

      {favoritesEnabled && (
        <li>
          <MenuButton small={small} onClick={onClick} to="/u/favorites" label={t('nav.favorites')} startIcon={<Favorite />} tabIndex={tabIndex} />
        </li>
      )}
      {showPaymentsItem && (
        <li>
          <MenuButton small={small} onClick={onClick} to="/u/payments" label={t('nav.payments')} startIcon={<BalanceWallet />} tabIndex={tabIndex} />
        </li>
      )}
      <li>
        <hr className={classNames(styles.divider, { [styles.small]: small })} />
      </li>
      <li>
        <MenuButton small={small} onClick={onLogout} label={t('nav.logout')} startIcon={<Exit />} tabIndex={tabIndex} />
      </li>
    </ul>
  );
};

export default UserMenu;
