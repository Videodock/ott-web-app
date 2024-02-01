import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FormErrors, GenericFormValues } from '@jwp/ott-common/types/form';
import type { CustomFormField } from '@jwp/ott-common/types/account';
import { testId } from '@jwp/ott-common/src/utils/common';

import Button from '../Button/Button';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import FormFeedback from '../FormFeedback/FormFeedback';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';

import styles from './PersonalDetailsForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  errors: FormErrors<Record<string, string>>;
  values: GenericFormValues;
  submitting: boolean;
  fields: CustomFormField[];
};

const PersonalDetailsForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting, fields }: Props) => {
  const { t } = useTranslation('account');

  return (
    <form onSubmit={onSubmit} data-testid={testId('personal_details-form')} noValidate>
      <h2 className={styles.title}>{t('personal_details.title')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {fields.map((field) => (
        <CustomRegisterField
          key={field.name}
          type={field.type}
          name={field.name}
          value={values[field.name] || ''}
          onChange={onChange}
          placeholder={field.placeholder}
          label={field.label}
          required={field.required}
          options={field.options}
        />
      ))}
      <Button
        className={styles.continue}
        type="submit"
        label={t('personal_details.continue')}
        variant="contained"
        color="primary"
        size="large"
        disabled={submitting}
        fullWidth
      />
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default PersonalDetailsForm;
