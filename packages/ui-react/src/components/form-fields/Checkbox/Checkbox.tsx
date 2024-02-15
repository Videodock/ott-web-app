import React, { type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import { FormField } from '../../FormField/FormField';
import type { FormControlProps } from '../../../types/form';

import styles from './Checkbox.module.scss';

type HTMLCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = HTMLCheckboxProps & {
  checked?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  checkboxLabel?: React.ReactNode;
  helperText?: React.ReactNode;
} & FormControlProps;

const Checkbox: React.FC<Props> = ({ className, label, checkboxLabel, name, onChange, editing, value, helperText, error, required, lang, size, ...rest }) => {
  const fieldClassName = classNames(styles.checkbox, { [styles.error]: error }, className);

  return (
    <FormField
      className={fieldClassName}
      name={name}
      label={label}
      editing={editing}
      required={required}
      error={error}
      helperText={helperText}
      renderInput={({ id, helperTextId }) => (
        <div className={styles.row}>
          <input name={name} type="checkbox" id={id} value={value} onChange={onChange} aria-required={required} aria-describedby={helperTextId} {...rest} />
          <label htmlFor={id} lang={lang}>
            {required ? <span role="presentation">*</span> : ''}
            {checkboxLabel}
          </label>
        </div>
      )}
    />
  );
};

export default Checkbox;
