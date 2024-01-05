import React, { AriaAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import DetectOutsideClick from '../DetectOutsideClick/DetectOutsideClick';
import Slide from '../Animation/Slide/Slide';

import styles from './Popover.module.scss';

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  'aria-expanded'?: AriaAttributes['aria-expanded'];
};

const Popover: React.FC<Props> = ({ children, isOpen, onClose, ...rest }: Props) => {
  return (
    <Slide open={isOpen} duration={250} direction="right" style={{ position: 'relative' }} {...rest}>
      <DetectOutsideClick callback={onClose}>
        <div className={classNames(styles.popover)}>{children}</div>
      </DetectOutsideClick>
    </Slide>
  );
};

export default Popover;
