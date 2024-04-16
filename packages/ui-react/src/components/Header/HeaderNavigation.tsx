import React from 'react';

import Button from '../Button/Button';

import styles from './Header.module.scss';

type NavItem = {
  label: string;
  to: string;
};

const HeaderNavigation = ({ navItems }: { navItems: NavItem[] }) => {
  return (
    <nav className={styles.nav}>
      <ul>
        {navItems.map((item, index) => (
          <li key={index}>
            <Button activeClassname={styles.navButton} label={item.label} to={item.to} variant="text" />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderNavigation;
