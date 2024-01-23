import React from 'react';
import classNames from 'classnames';

import type { TagProps } from '../../../types/components';
import { TAG_COMPONENT } from '../../modules/types';
import InjectableComponent from '../../modules/InjectableComponent';

import styles from './Tag.module.scss';

const DefaultTag: React.FC<TagProps> = ({ children, className, isLive = false, size = 'normal' }: TagProps) => {
  return (
    <div
      className={classNames(className, styles.tag, styles[size], {
        [styles.live]: isLive,
      })}
    >
      {children}
    </div>
  );
};

const Tag = (props: TagProps) => InjectableComponent(TAG_COMPONENT, props, DefaultTag);

export default Tag;
