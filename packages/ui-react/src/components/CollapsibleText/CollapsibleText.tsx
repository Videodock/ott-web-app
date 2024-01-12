import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import useBreakpoint from '@jwp/ott-hooks-react/src/useBreakpoint';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './CollapsibleText.module.scss';

type Props = {
  text: string;
  className?: string;
  maxHeight?: 'none' | number;
};

const CollapsibleText: React.FC<Props> = ({ text, className, maxHeight = 'none' }: Props) => {
  const divRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const breakpoint = useBreakpoint();
  const [doesFlowOver, setDoesFlowOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const ariaLabel = expanded ? 'Collapse' : 'Expand';

  const clippablePixels = 4;

  useEffect(() => {
    divRef.current &&
      setDoesFlowOver(
        divRef.current.scrollHeight > divRef.current.offsetHeight + clippablePixels || (maxHeight !== 'none' && maxHeight < divRef.current.offsetHeight),
      );
  }, [maxHeight, text, breakpoint]);

  return (
    <div className={classNames(styles.collapsibleText)}>
      <div
        ref={divRef}
        className={classNames(styles.textContainer, className, { [styles.collapsed]: !expanded && doesFlowOver })}
        style={{ maxHeight: expanded ? divRef.current.scrollHeight : maxHeight }}
      >
        {text}
      </div>
      {doesFlowOver && (
        <IconButton aria-label={ariaLabel} className={classNames(styles.chevron, { [styles.expanded]: expanded })} onClick={() => setExpanded(!expanded)}>
          <Icon icon={ChevronRight} />
        </IconButton>
      )}
    </div>
  );
};

export default CollapsibleText;
