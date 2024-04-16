import classNames from 'classnames';
import React, { type ButtonHTMLAttributes } from 'react';

import styles from './IconButton.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: () => void;
  onBlur?: () => void;
  children: JSX.Element;
  className?: string;
};

const IconButton: React.FC<Props> = ({ children, onClick, className, ...ariaProps }: Props) => {
  return (
    <button className={classNames(styles.iconButton, className)} onClick={onClick} {...ariaProps}>
      {children}
    </button>
  );
};

export default IconButton;
