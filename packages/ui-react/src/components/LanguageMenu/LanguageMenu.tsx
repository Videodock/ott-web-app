import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';
import classNames from 'classnames';
import { t } from 'i18next';
import { Fragment, useState, type MouseEvent } from 'react';

import Language from '../../icons/Language';
import IconButton from '../IconButton/IconButton';
import Link from '../Link/Link';
import Panel from '../Panel/Panel';
import Popover from '../Popover/Popover';

import styles from './LanguageMenu.module.scss';

type Props = {
  onClick?: (code: string) => void;
  languages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
};

const LanguageMenu = ({ onClick, languages, currentLanguage }: Props) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const handleOnBlur = () => setLanguageMenuOpen(false);
  const handleOnFocus = () => setLanguageMenuOpen(true);
  const handleMenuToggle = () => setLanguageMenuOpen(!languageMenuOpen);
  const handleLanguageSelect = (event: MouseEvent<HTMLElement>, code: string) => {
    event.preventDefault();
    if (onClick) {
      onClick(code);
    }

    setLanguageMenuOpen(false);
  };

  return (
    <Fragment>
      <IconButton
        aria-controls="language-panel"
        aria-expanded={languageMenuOpen}
        className={classNames(styles.iconButton, styles.actionButton)}
        aria-label={t('select_language')}
        onClick={handleMenuToggle}
      >
        <Language />
      </IconButton>

      <Popover isOpen={languageMenuOpen} onClose={() => setLanguageMenuOpen(false)} aria-expanded={languageMenuOpen}>
        <Panel id="language-panel">
          <ul className={styles.menuItems}>
            {languages.map(({ code, displayName }) => {
              const menuItemClassname = classNames(styles.menuItem, { [styles.menuItemActive]: currentLanguage?.code === code });

              return (
                <li
                  key={code}
                  className={menuItemClassname}
                  onFocus={handleOnFocus}
                  onBlur={handleOnBlur}
                  onClick={(event) => handleLanguageSelect(event, code)}
                >
                  <Link href="#">{displayName}</Link>
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
