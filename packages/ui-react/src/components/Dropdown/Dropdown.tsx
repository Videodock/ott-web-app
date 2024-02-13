import React from 'react';

import { FormField } from '../FormField/FormField';
import Select from '../Select/Select';
import type { FieldProps } from '../../types/form-fields';

type Props = {
  defaultLabel?: string;
  options?: (string | { value: string; label: string })[];
  optionsStyle?: string;
  fullWidth?: boolean;
  onChange: React.ChangeEventHandler;
  helperText?: React.ReactNode;
} & FieldProps;

const Dropdown: React.FC<Props> = ({
  name,
  value,
  className,
  label,
  fullWidth,
  error,
  helperText,
  editing = true,
  required = false,
  size = 'medium',
  testId,
  lang,
  ...rest
}) => {
  return (
    <FormField
      className={className}
      error={error}
      helperText={helperText}
      label={label}
      required={required}
      editing={editing}
      testId={testId}
      name={name}
      size={size}
    >
      {({ helperTextId, id }) => (
        <Select id={id} helperTextId={helperTextId} name={name} required={required} editing={editing} error={error} size={size} {...rest} />
      )}
    </FormField>
  );
};

export default Dropdown;
