import React, { type PropsWithChildren } from 'react';

import styles from './Header.module.scss';

const HeaderActions = ({ children }: PropsWithChildren) => {
  return <div className={styles.actions}>{children}</div>;
};

export default HeaderActions;
