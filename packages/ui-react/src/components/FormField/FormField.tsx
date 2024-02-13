import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';
import type { FieldProps } from '../../types/form-fields';

import styles from './FormField.module.scss';

type Props = {
  children: (inputProps: { helperTextId: string; id: string }) => React.ReactNode;
  showOptionalLabel?: boolean;
  helperText?: React.ReactNode;
} & FieldProps;

export const FormField = ({ className, children, required, label, error, helperText, testId, name, editing = true, showOptionalLabel = true }: Props) => {
  const { t } = useTranslation('common');
  const formFieldClassName = classNames(styles.formField, className);
  const id = useOpaqueId('text-field', name);
  const helperTextId = useOpaqueId('helper_text', name);

  return (
    <div className={formFieldClassName} data-testid={testId}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {!required && editing && showOptionalLabel ? <span>{t('optional')}</span> : null}
      </label>
      {children({ helperTextId, id })}
      <HelperText id={helperTextId} error={error}>
        {helperText}
      </HelperText>
    </div>
  );
};
