import React, { type PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  searchActive: boolean;
};

const Header = ({ children, headerType = 'static', searchActive }: PropsWithChildren<Props>) => {
  const headerClassName = classNames(styles.header, styles[headerType], {
    [styles.searchActive]: searchActive,
  });

  return (
    <header className={headerClassName}>
      <div className={styles.container}>{children}</div>
    </header>
  );
};
export default Header;
