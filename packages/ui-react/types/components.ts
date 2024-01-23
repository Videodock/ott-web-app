import type { ReactNode, FC } from 'react';

export type TagProps = {
  className?: string;
  isLive?: boolean;
  children?: ReactNode;
  size?: 'normal' | 'large';
};

export type Tag = FC<TagProps>;
