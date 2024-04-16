import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import type { Profile } from '@jwp/ott-common/types/profiles';

import Icon from '../Icon/Icon';
import ProfileCircle from '../ProfileCircle/ProfileCircle';
import Popover from '../Popover/Popover';
import Panel from '../Panel/Panel';
import ProfilesMenu from '../ProfilesMenu/ProfilesMenu';
import Button from '../Button/Button';
import UserMenuNav from '../UserMenuNav/UserMenuNav';
import HeaderActionButton from '../Header/HeaderActionButton';

import styles from './UserMenu.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onLoginButtonClick: () => void;
  onSignUpButtonClick: () => void;
  isLoggedIn: boolean;
  favoritesEnabled: boolean;
  profilesEnabled: boolean;
  profile: Profile | null;
  profiles: Profile[] | null;
  profileLoading: boolean;
  onSelectProfile: (params: { id: string; avatarUrl: string }) => void;
};

const UserMenu = ({
  isLoggedIn,
  favoritesEnabled,
  open,
  onClose,
  onOpen,
  onLoginButtonClick,
  onSignUpButtonClick,
  profilesEnabled,
  profile,
  profiles,
  profileLoading,
  onSelectProfile,
}: Props) => {
  const { t } = useTranslation('menu');

  if (!isLoggedIn) {
    return (
      <div className={styles.buttonContainer}>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} aria-haspopup="dialog" />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} aria-haspopup="dialog" />
      </div>
    );
  }

  return (
    <div>
      <HeaderActionButton
        aria-label={t('open_user_menu')}
        aria-controls="menu_panel"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onOpen}
        onBlur={onClose}
      >
        {profilesEnabled && profile ? <ProfileCircle src={profile.avatar_url} alt={profile.name || t('profile_icon')} /> : <Icon icon={AccountCircle} />}
      </HeaderActionButton>
      <Popover className={styles.popover} isOpen={open} onClose={onClose}>
        <Panel id="menu_panel">
          <div onFocus={onOpen} onBlur={onClose}>
            {profilesEnabled && (
              <ProfilesMenu
                onButtonClick={onClose}
                profiles={profiles ?? []}
                currentProfile={profile}
                selectingProfile={profileLoading}
                selectProfile={onSelectProfile}
                small
              />
            )}
            <UserMenuNav focusable={open} onButtonClick={onClose} showPaymentItems={true} currentProfile={profile} favoritesEnabled={favoritesEnabled} small />
          </div>
        </Panel>
      </Popover>
    </div>
  );
};

export default UserMenu;
