import React, { ReactFragment, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Profile } from '@jwp/ott-common/types/account';
import useBreakpoint, { Breakpoint } from '@jwp/ott-hooks-react/src/useBreakpoint';
import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';

import Menu from '../../icons/Menu';
import SearchIcon from '../../icons/Search';
import CloseIcon from '../../icons/Close';
import SearchBar, { Props as SearchBarProps } from '../SearchBar/SearchBar';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import UserMenu from '../UserMenu/UserMenu';
import IconButton from '../IconButton/IconButton';
import LanguageMenu from '../LanguageMenu/LanguageMenu';
import AccountCircle from '../../icons/AccountCircle';
import ProfileCircle from '../../icons/ProfileCircle';
import Panel from '../Panel/Panel';
import Popover from '../Popover/Popover';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string | null;
  searchBarProps: SearchBarProps;
  searchEnabled: boolean;
  searchActive: boolean;
  onSearchButtonClick?: () => void;
  onCloseSearchButtonClick?: () => void;
  onLoginButtonClick?: () => void;
  onSignUpButtonClick?: () => void;
  openUserMenu: () => void;
  closeUserMenu: () => void;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
  children?: ReactFragment;
  isLoggedIn: boolean;
  userMenuOpen: boolean;
  languageMenuOpen: boolean;
  canLogin: boolean;
  showPaymentsMenuItem: boolean;
  supportedLanguages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
  onLanguageClick: (code: string) => void;

  favoritesEnabled?: boolean;

  profilesData?: {
    currentProfile: Profile | null;
    profiles: Profile[];
    profilesEnabled: boolean;
    selectProfile: ({ avatarUrl, id }: { avatarUrl: string; id: string }) => void;
    isSelectingProfile: boolean;
  };
};

const Header: React.FC<Props> = ({
  children,
  headerType = 'static',
  onMenuButtonClick,
  logoSrc,
  searchBarProps,
  searchActive,
  onSearchButtonClick,
  searchEnabled,
  onLoginButtonClick,
  onCloseSearchButtonClick,
  onSignUpButtonClick,
  isLoggedIn,
  userMenuOpen,
  languageMenuOpen,
  openUserMenu,
  closeUserMenu,
  openLanguageMenu,
  closeLanguageMenu,
  canLogin = false,
  showPaymentsMenuItem,
  supportedLanguages,
  currentLanguage,
  onLanguageClick,
  favoritesEnabled,
  profilesData: { currentProfile, profiles, profilesEnabled, selectProfile, isSelectingProfile } = {},
}) => {
  const { t } = useTranslation('menu');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const breakpoint = useBreakpoint();
  const headerClassName = classNames(styles.header, styles[headerType], {
    [styles.searchActive]: searchActive,
  });

  // only show the language dropdown when there are other languages to choose from
  const showLanguageSwitcher = supportedLanguages.length > 1;

  const renderSearch = () => {
    if (!searchEnabled) return null;

    return searchActive ? (
      <div className={styles.searchContainer}>
        <SearchBar {...searchBarProps} />
        <IconButton
          className={styles.iconButton}
          aria-label="Close search"
          onClick={() => {
            if (onCloseSearchButtonClick) {
              onCloseSearchButtonClick();
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    ) : (
      <IconButton
        className={classNames(styles.iconButton, styles.actionButton)}
        aria-label="Open search"
        onClick={() => {
          if (onSearchButtonClick) {
            onSearchButtonClick();
          }
        }}
      >
        <SearchIcon />
      </IconButton>
    );
  };

  const renderUserActions = () => {
    if (!canLogin || breakpoint <= Breakpoint.sm) return null;

    return isLoggedIn ? (
      <React.Fragment>
        <IconButton
          className={classNames(styles.iconButton, styles.actionButton)}
          aria-label={t('open_user_menu')}
          aria-controls="user_menu_panel"
          aria-expanded={userMenuOpen}
          onClick={openUserMenu}
          onBlur={closeUserMenu}
        >
          {profilesEnabled && currentProfile ? (
            <ProfileCircle src={currentProfile.avatar_url} alt={currentProfile.name || t('profile_icon')} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <Popover isOpen={userMenuOpen} onClose={closeUserMenu}>
          <Panel id="user_menu_panel">
            <UserMenu
              focusable={userMenuOpen}
              onClick={closeUserMenu}
              onFocus={openUserMenu}
              onBlur={closeUserMenu}
              showPaymentsItem={showPaymentsMenuItem}
              currentProfile={currentProfile}
              profilesEnabled={profilesEnabled}
              profiles={profiles}
              selectProfile={selectProfile}
              isSelectingProfile={!!isSelectingProfile}
              favoritesEnabled={favoritesEnabled}
              small
            />
          </Panel>
        </Popover>
      </React.Fragment>
    ) : (
      <div className={styles.buttonContainer}>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} />
      </div>
    );
  };

  const renderLanguageDropdown = () => {
    if (!showLanguageSwitcher) return null;

    return (
      <LanguageMenu
        openLanguageMenu={openLanguageMenu}
        closeLanguageMenu={closeLanguageMenu}
        languageMenuOpen={languageMenuOpen}
        onClick={(code) => {
          onLanguageClick(code);
        }}
        languages={supportedLanguages}
        currentLanguage={currentLanguage}
      />
    );
  };

  return (
    <header className={headerClassName}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <IconButton className={styles.iconButton} aria-label={t('open_menu')} onClick={onMenuButtonClick}>
            <Menu />
          </IconButton>
        </div>
        <a href="#content" className={styles.skipToContent}>
          {t('skip_to_content')}
        </a>
        {logoSrc && (
          <div className={styles.brand}>
            <Logo src={logoSrc} onLoad={() => setLogoLoaded(true)} />
          </div>
        )}
        <nav className={styles.nav} aria-label="menu">
          {logoLoaded || !logoSrc ? children : null}
        </nav>
        <div className={styles.actions}>
          {renderSearch()}
          {renderLanguageDropdown()}
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
};
export default Header;
