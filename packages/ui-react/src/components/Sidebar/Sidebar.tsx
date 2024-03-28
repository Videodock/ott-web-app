import React, { Fragment, type ReactNode, type RefObject, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';
import { useModal } from '../../containers/ModalProvider/useModal';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  containerRef?: RefObject<HTMLElement>;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, containerRef, children }) => {
  const { t } = useTranslation('menu');
  const sidebarRef = useRef<HTMLDivElement>(null);

  useModal({ open: isOpen, onClose, modalRef: sidebarRef, containerRef });

  const htmlAttributes = { inert: !isOpen ? '' : undefined }; // inert is not yet officially supported in react. see: https://github.com/facebook/react/pull/24730

  useEffect(() => {
    // Scroll the sidebar to the top if the user has previously scrolled down in the sidebar
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  return (
    <Fragment>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: isOpen,
        })}
        onClick={onClose}
      />
      <div
        ref={sidebarRef}
        className={classNames(styles.sidebar, {
          [styles.open]: isOpen,
        })}
        id="sidebar"
        {...htmlAttributes}
      >
        <div className={styles.heading}>
          <IconButton onClick={onClose} aria-label={t('close_menu')}>
            <Icon icon={Close} />
          </IconButton>
        </div>
        <nav className={styles.group} onClick={onClose}>
          {children}
        </nav>
      </div>
    </Fragment>
  );
};

export default Sidebar;
