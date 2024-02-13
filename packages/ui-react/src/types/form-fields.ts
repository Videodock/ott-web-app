import type React from 'react';

export type FieldProps = {
  name: string;
  label?: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: boolean;
  editing?: boolean;
  testId?: string;
  value?: string;
  lang?: string;
  size?: 'small' | 'medium';
};
