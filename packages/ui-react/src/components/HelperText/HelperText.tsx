import React from 'react';
import classNames from 'classnames';

import styles from './HelperText.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  id?: string;
};

const HelperText: React.FC<Props> = ({ children, className, error, id }: Props) => {
  return children ? (
    <div id={id} aria-live={error ? 'assertive' : 'polite'} className={classNames(styles.helperText, { [styles.error]: error }, className)}>
      {children}
    </div>
  ) : null;
};

export default HelperText;
