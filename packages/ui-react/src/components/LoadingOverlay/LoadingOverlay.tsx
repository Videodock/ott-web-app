import React from 'react';
import classNames from 'classnames';

import Spinner from '../Spinner/Spinner';

import styles from './LoadingOverlay.module.scss';

type Props = {
  transparentBackground?: boolean;
  inline?: boolean;
};

const LoadingOverlay = ({ transparentBackground = false, inline = false }: Props): JSX.Element => {
  const className = classNames(styles.loadingOverlay, {
    [styles.transparent]: transparentBackground,
    [styles.fixed]: !inline,
    [styles.inline]: inline,
  });

  return (
    <div className={className}>
      <Spinner size="medium" />
    </div>
  );
};
export default LoadingOverlay;
