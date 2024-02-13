import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import { FormField } from '../FormField/FormField';
import type { FieldProps } from '../../types/form-fields';

import styles from './Checkbox.module.scss';

type HTMLCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = HTMLCheckboxProps & {
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  header?: string;
  helperText?: React.ReactNode;
} & FieldProps;

const Checkbox: React.FC<Props> = ({ className, label, name, onChange, editing, header, value, helperText, error, required, lang, size, ...rest }) => {
  const fieldClassName = classNames(styles.checkbox, { [styles.error]: error }, className);

  return (
    <FormField
      className={fieldClassName}
      name={name}
      label={header}
      editing={editing}
      required={required}
      error={error}
      helperText={helperText}
      showOptionalLabel={false}
    >
      {({ id, helperTextId }) => (
        <div className={styles.row}>
          <input name={name} type="checkbox" id={id} value={value} onChange={onChange} aria-required={required} aria-describedby={helperTextId} {...rest} />
          <label htmlFor={id} lang={lang}>
            {required ? '* ' : ''}
            {label}
          </label>
        </div>
      )}
    </FormField>
  );
};

export default Checkbox;
