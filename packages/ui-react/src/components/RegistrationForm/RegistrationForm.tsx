import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import type { FormErrors } from '@jwp/ott-common/types/form';
import type { CustomFormField, RegistrationFormData } from '@jwp/ott-common/types/account';
import { testId } from '@jwp/ott-common/src/utils/common';

import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';
import FormFeedback from '../FormFeedback/FormFeedback';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Link from '../Link/Link';
import { modalURLFromLocation } from '../../utils/location';
import PasswordField from '../PasswordField/PasswordField';

import styles from './RegistrationForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  errors: FormErrors<RegistrationFormData>;
  values: RegistrationFormData;
  loading: boolean;
  submitting: boolean;
  canSubmit: boolean;
  consents: CustomFormField[] | null;
  registrationFields: CustomFormField[] | null;
};

const RegistrationForm: React.FC<Props> = ({
  onSubmit,
  onChange,
  onBlur,
  values,
  errors,
  submitting,
  loading,
  canSubmit,
  consents,
  registrationFields,
}: Props) => {
  const { t } = useTranslation('account');
  const location = useLocation();

  const ref = useRef<HTMLDivElement>(null);

  const formatConsentLabel = (label: string): string | JSX.Element => {
    const sanitizedLabel = DOMPurify.sanitize(label);
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(sanitizedLabel);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(sanitizedLabel);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  useEffect(() => {
    if (errors.form) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [errors.form]);

  if (loading) {
    return (
      <div style={{ height: 400 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-testid={testId('registration-form')} noValidate>
      <h2 className={styles.title}>{t('registration.sign_up')}</h2>
      <div ref={ref}>{errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}</div>
      <TextField
        value={values.email}
        onChange={onChange}
        onBlur={onBlur}
        label={t('registration.email')}
        placeholder={t('registration.email')}
        error={!!errors.email || !!errors.form}
        helperText={errors.email}
        name="email"
        type="email"
        required
      />
      <PasswordField
        name="password"
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
        label={t('registration.password')}
        placeholder={t('registration.password')}
        error={!!errors.password || !!errors.form}
        required
      />
      {consents && (
        <div className={styles.customFields} data-testid="consents">
          {consents.map((consent) => (
            <CustomRegisterField
              key={consent.name}
              type={consent.type}
              name={`consents.${consent.name}`}
              options={consent.options}
              label={formatConsentLabel(consent.label)}
              placeholder={consent.placeholder}
              value={values.consents[consent.name] || ''}
              required={consent.required}
              error={!!errors.consents?.[consent.name]}
              helperText={errors.consents?.[consent.name]}
              onChange={onChange}
            />
          ))}
        </div>
      )}
      {registrationFields && (
        <div className={styles.customFields} data-testid="custom-reg-fields">
          {registrationFields.map((field) => (
            <CustomRegisterField
              key={field.name}
              type={field.type}
              name={`registrationFields.${field.name}`}
              options={field.options}
              label={field.label}
              placeholder={field.placeholder}
              value={values.registrationFields[field.name] || ''}
              required={field.required}
              error={!!errors.registrationFields?.[field.name]}
              helperText={errors.registrationFields?.[field.name]}
              onChange={onChange}
            />
          ))}
        </div>
      )}
      <Button
        className={styles.continue}
        type="submit"
        label={t('registration.continue')}
        variant="contained"
        color="primary"
        size="large"
        disabled={submitting || !canSubmit}
        fullWidth
      />
      <p className={styles.bottom}>
        {t('registration.already_account')} <Link to={modalURLFromLocation(location, 'login')}>{t('login.sign_in')}</Link>
      </p>
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default RegistrationForm;
