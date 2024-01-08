import classNames from 'classnames';
import React, { AriaAttributes } from 'react';

import styles from './IconButton.module.scss';

type Props = {
  onClick?: () => void;
  onBlur?: () => void;
  children: JSX.Element;
  tabIndex?: number;
  className?: string;
  'aria-label': AriaAttributes['aria-label'];
  'aria-controls'?: AriaAttributes['aria-controls'];
};

const IconButton: React.FC<Props> = ({ children, onClick, tabIndex = 0, className, ...rest }: Props) => {
  return (
    <div
      {...rest}
      className={classNames(styles.iconButton, className)}
      onClick={onClick}
      role="button"
      tabIndex={tabIndex}
      onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && tabIndex >= 0 && onClick && onClick()}
    >
      {children}
    </div>
  );
};

export default IconButton;
