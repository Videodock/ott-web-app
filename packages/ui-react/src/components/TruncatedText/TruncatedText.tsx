import React from 'react';
import classNames from 'classnames';

import styles from './TruncatedText.module.scss';

type TruncatedTextProps = {
  text: string;
  maximumLines: number;
  className?: string;
};

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maximumLines, className }) => {
  return (
    <div
      className={classNames(styles.truncatedText, className)}
      style={{
        maxHeight: `calc(1.5em * ${maximumLines})`,
        WebkitLineClamp: maximumLines,
      }}
    >
      {text}
    </div>
  );
};

export default TruncatedText;
