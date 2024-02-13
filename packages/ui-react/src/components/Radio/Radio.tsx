import React, { type InputHTMLAttributes } from 'react';

import type { FieldProps } from '../../types/form-fields';
import { FormField } from '../FormField/FormField';

import styles from './Radio.module.scss';

type HTMLRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

type Props = HTMLRadioProps & {
  values: { value: string; label: string }[];
  helperText?: React.ReactNode;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
} & FieldProps;

const Radio: React.FC<Props> = ({ name, onChange, label, value, size, values, helperText, error, required, disabled, lang, ...rest }) => {
  return (
    <FormField name={name} label={label} error={error} helperText={helperText} required={required}>
      {({ id, helperTextId }) => (
        <>
          {values.map(({ value: optionValue, label: optionLabel }, index) => (
            <div className={styles.radio} key={index} lang={lang}>
              <input
                value={optionValue}
                name={name}
                type="radio"
                id={id + index}
                onChange={onChange}
                checked={value === optionValue}
                required={required}
                disabled={disabled}
                aria-describedby={helperTextId}
                {...rest}
              />
              <label htmlFor={id + index}>{optionLabel}</label>
            </div>
          ))}
        </>
      )}
    </FormField>
  );
};

export default Radio;
