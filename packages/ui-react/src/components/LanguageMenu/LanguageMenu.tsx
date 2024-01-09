import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';
import classNames from 'classnames';
import { Fragment, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { testId } from '@jwp/ott-common/src/utils/common';

import Language from '../../icons/Language';
import IconButton from '../IconButton/IconButton';
import Link from '../Link/Link';
import Panel from '../Panel/Panel';
import Popover from '../Popover/Popover';

import styles from './LanguageMenu.module.scss';

type Props = {
  onClick: (code: string) => void | null;
  languages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
  languageMenuOpen: boolean;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
};

const LanguageMenu = ({ onClick, languages, currentLanguage, languageMenuOpen, closeLanguageMenu, openLanguageMenu }: Props) => {
  const { t } = useTranslation('menu');

  const handleLanguageSelect = (event: MouseEvent<HTMLElement>, code: string) => {
    event.preventDefault();
    onClick && onClick(code);

    closeLanguageMenu();
  };

  const handleMenuToggle = () => {
    if (languageMenuOpen) {
      closeLanguageMenu();
    } else {
      openLanguageMenu();
    }
  };

  return (
    <Fragment>
      <IconButton
        data-testid={testId('language-menu-button')}
        aria-controls="language-panel"
        aria-expanded={languageMenuOpen}
        className={classNames(styles.iconButton, styles.actionButton)}
        aria-label={t('language_menu')}
        onClick={handleMenuToggle}
        onBlur={closeLanguageMenu}
      >
        <Language />
      </IconButton>

      <Popover isOpen={languageMenuOpen} onClose={closeLanguageMenu} aria-expanded={languageMenuOpen}>
        <Panel id="language-panel">
          <ul className={styles.menuItems}>
            {languages.map(({ code, displayName }) => {
              const menuItemClassname = classNames(styles.menuItem, { [styles.menuItemActive]: currentLanguage?.code === code });

              return (
                <li key={code} className={menuItemClassname} onClick={(event) => handleLanguageSelect(event, code)}>
                  <Link onFocus={openLanguageMenu} onBlur={closeLanguageMenu} href="#">
                    {displayName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Popover>
    </Fragment>
  );
};

export default LanguageMenu;
