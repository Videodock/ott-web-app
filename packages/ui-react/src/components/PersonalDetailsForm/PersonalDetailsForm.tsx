import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FormErrors } from '@jwp/ott-common/types/form';
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
  setValue: (key: string, value: string) => void;
  error?: string;
  errors: FormErrors<Record<string, string>>;
  values: Record<string, string>;
  submitting: boolean;
  fields: CustomFormField[];
};

const PersonalDetailsForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting, fields }: Props) => {
  const { t } = useTranslation('account');

  console.log(values);

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

      {/*{fields.firstNameLastName?.enabled ? (*/}
      {/*  <React.Fragment>*/}
      {/*    <TextField*/}
      {/*      value={values.firstName}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.fist_name')}*/}
      {/*      placeholder={t('personal_details.fist_name')}*/}
      {/*      error={!!errors.firstName || !!errors.form}*/}
      {/*      helperText={errors.firstName}*/}
      {/*      required={fields.firstNameLastName.required}*/}
      {/*      name="firstName"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      value={values.lastName}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.last_name')}*/}
      {/*      placeholder={t('personal_details.last_name')}*/}
      {/*      error={!!errors.lastName || !!errors.form}*/}
      {/*      helperText={errors.lastName}*/}
      {/*      required={fields.firstNameLastName.required}*/}
      {/*      name="lastName"*/}
      {/*    />*/}
      {/*  </React.Fragment>*/}
      {/*) : null}*/}
      {/*{fields.companyName?.enabled ? (*/}
      {/*  <TextField*/}
      {/*    value={values.companyName}*/}
      {/*    onChange={onChange}*/}
      {/*    label={t('personal_details.company_name')}*/}
      {/*    placeholder={t('personal_details.company_name')}*/}
      {/*    error={!!errors.companyName || !!errors.form}*/}
      {/*    helperText={errors.companyName}*/}
      {/*    required={fields.companyName.required}*/}
      {/*    name="companyName"*/}
      {/*  />*/}
      {/*) : null}*/}
      {/*{fields.address?.enabled ? (*/}
      {/*  <React.Fragment>*/}
      {/*    <TextField*/}
      {/*      value={values.address}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.address')}*/}
      {/*      placeholder={t('personal_details.address')}*/}
      {/*      error={!!errors.address || !!errors.form}*/}
      {/*      helperText={errors.address}*/}
      {/*      required={fields.address.required}*/}
      {/*      name="address"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      value={values.address2}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.address2')}*/}
      {/*      placeholder={t('personal_details.address2')}*/}
      {/*      error={!!errors.address2 || !!errors.form}*/}
      {/*      helperText={errors.address2}*/}
      {/*      name="address2"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      value={values.city}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.city')}*/}
      {/*      placeholder={t('personal_details.city')}*/}
      {/*      error={!!errors.city || !!errors.form}*/}
      {/*      helperText={errors.city}*/}
      {/*      required={fields.address.required}*/}
      {/*      name="city"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      value={values.state}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.state')}*/}
      {/*      placeholder={t('personal_details.state')}*/}
      {/*      error={!!errors.state || !!errors.form}*/}
      {/*      helperText={errors.state}*/}
      {/*      required={fields.address.required}*/}
      {/*      name="state"*/}
      {/*    />*/}
      {/*    <TextField*/}
      {/*      value={values.postCode}*/}
      {/*      onChange={onChange}*/}
      {/*      label={t('personal_details.post_code')}*/}
      {/*      placeholder={t('personal_details.post_code')}*/}
      {/*      error={!!errors.postCode || !!errors.form}*/}
      {/*      helperText={errors.postCode}*/}
      {/*      required={fields.address.required}*/}
      {/*      name="postCode"*/}
      {/*    />*/}
      {/*  </React.Fragment>*/}
      {/*) : null}*/}
      {/*{fields.phoneNumber?.enabled ? (*/}
      {/*  <TextField*/}
      {/*    value={values.phoneNumber}*/}
      {/*    onChange={onChange}*/}
      {/*    label={t('personal_details.phone_number')}*/}
      {/*    placeholder={t('personal_details.phone_number')}*/}
      {/*    error={!!errors.phoneNumber || !!errors.form}*/}
      {/*    helperText={errors.phoneNumber}*/}
      {/*    required={fields.phoneNumber.required}*/}
      {/*    name="phoneNumber"*/}
      {/*  />*/}
      {/*) : null}*/}
      {/*{fields.birthDate?.enabled ? (*/}
      {/*  <DateField*/}
      {/*    value={values.birthDate}*/}
      {/*    onChange={(event) => setValue('birthDate', event.currentTarget.value)}*/}
      {/*    label={t('personal_details.birth_date')}*/}
      {/*    error={!!errors.birthDate || !!errors.form}*/}
      {/*    helperText={errors.birthDate}*/}
      {/*    required={fields.birthDate.required}*/}
      {/*    name="birthDate"*/}
      {/*  />*/}
      {/*) : null}*/}
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
