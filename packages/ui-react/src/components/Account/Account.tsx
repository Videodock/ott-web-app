import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import DOMPurify from 'dompurify';
import { useMutation, useQuery } from 'react-query';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { isTruthy, logDev } from '@jwp/ott-common/src/utils/common';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import useToggle from '@jwp/ott-hooks-react/src/useToggle';
import Visibility from '@jwp/ott-theme/assets/icons/visibility.svg?react';
import VisibilityOff from '@jwp/ott-theme/assets/icons/visibility_off.svg?react';
import { formatConsentsValues } from '@jwp/ott-common/src/utils/collection';
import env from '@jwp/ott-common/src/env';

import type { FormSectionContentArgs, FormSectionProps } from '../Form/FormSection';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import Form from '../Form/Form';
import IconButton from '../IconButton/IconButton';
import TextField from '../TextField/TextField';
import Checkbox from '../Checkbox/Checkbox';
import HelperText from '../HelperText/HelperText';
import CustomRegisterField from '../CustomRegisterField/CustomRegisterField';
import Icon from '../Icon/Icon';
import { modalURLFromLocation } from '../../utils/location';
import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';

import styles from './Account.module.scss';

type Props = {
  panelClassName?: string;
  panelHeaderClassName?: string;
  canUpdateEmail?: boolean;
};

const Account = ({ panelClassName, panelHeaderClassName, canUpdateEmail = true }: Props): JSX.Element => {
  const accountController = getModule(AccountController);

  const { t, i18n } = useTranslation('user');
  const announce = useAriaAnnouncer();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewPassword, toggleViewPassword] = useToggle();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const exportData = useMutation(accountController.exportAccountData, {
    onSettled: () => setIsAlertVisible(true),
  });
  const exportDataMessage = exportData.isSuccess ? t('account.export_data_success') : t('account.export_data_error');
  const htmlLang = i18n.language !== env.APP_DEFAULT_LANGUAGE ? env.APP_DEFAULT_LANGUAGE : undefined;

  useQuery(['consents'], accountController.getConsents);
  useQuery(['consentsValues'], accountController.getConsentsValues);
  useQuery(['registrationFields'], accountController.getRegistrationFields);

  const { customer, consentsFields, consentsFormValues, registrationFields, registrationFieldsValues } = useAccountStore(
    (s) => ({
      customer: s.user,
      consentsFields: s.consents || [],
      consentsFormValues: formatConsentsValues(s.consentsValues || []),
      registrationFields: s.registrationFields || [],
      registrationFieldsValues: s.registrationFieldsValues || {},
    }),
    shallow,
  );

  const { canChangePasswordWithOldPassword, canExportAccountData, canDeleteAccount } = accountController.getFeatures();
  // users authenticated with social (register_source: Facebook, Google, X (Twitter)) do not have password by default
  const registerSource = customer?.metadata?.register_source;
  const isSocialLogin = (registerSource && registerSource !== 'inplayer') || false;
  const shouldAddPassword = (isSocialLogin && !customer?.metadata?.has_password) || false;

  const initialValues = useMemo(
    () => ({
      consents: consentsFormValues,
      registrationFields: registrationFieldsValues,
      updateEmail: {
        confirmationPassword: '',
        email: customer?.email || '',
      },
    }),
    [consentsFormValues, registrationFieldsValues, customer?.email],
  );

  const formatConsentLabel = (label: string): string | JSX.Element => {
    const sanitizedLabel = DOMPurify.sanitize(label);
    const hasHrefOpenTag = /<a(.|\n)*?>/.test(sanitizedLabel);
    const hasHrefCloseTag = /<\/a(.|\n)*?>/.test(sanitizedLabel);

    if (hasHrefOpenTag && hasHrefCloseTag) {
      return <span dangerouslySetInnerHTML={{ __html: label }} />;
    }

    return label;
  };

  function translateErrors(errors?: string[]): Record<string, string> {
    const formErrors: Record<string, string> = { form: '' };
    // Some errors are combined in a single CSV string instead of one string per error
    errors
      ?.flatMap((e) => e.split(','))
      .forEach((error) => {
        switch (error.trim()) {
          case 'Invalid param email':
            formErrors.email = t('account.errors.invalid_param_email');
            break;
          case 'Customer email already exists':
            formErrors.email = t('account.errors.email_exists');
            break;
          case 'Please enter a valid e-mail address.':
            formErrors.email = t('account.errors.please_enter_valid_email');
            break;
          case 'Invalid confirmationPassword': {
            formErrors.confirmationPassword = t('account.errors.invalid_password');
            break;
          }
          case 'firstName can have max 50 characters.': {
            formErrors.firstName = t('account.errors.first_name_too_long');
            break;
          }
          case 'lastName can have max 50 characters.': {
            formErrors.lastName = t('account.errors.last_name_too_long');
            break;
          }
          case 'Email update not supported': {
            formErrors.form = t('account.errors.email_update_not_supported');
            break;
          }
          default: {
            formErrors.form = t('account.errors.unknown_error');
            logDev('Unknown error', error);
            break;
          }
        }
      });

    return formErrors;
  }

  function formSection(props: FormSectionProps<typeof initialValues, Record<string, string>>) {
    return {
      ...props,
      className: panelClassName,
      panelHeaderClassName: panelHeaderClassName,
      saveButton: t('account.save'),
      cancelButton: t('account.cancel'),
      content: (args: FormSectionContentArgs<typeof initialValues, string[]>) => {
        // This function just allows the sections below to use the FormError type instead of an array of errors
        // @TODO move this (translate errors) to controller
        const formErrors = translateErrors(args.errors);

        // Render the section content, but also add a warning text if there's a form level error
        return (
          <>
            {props.content?.({ ...args, errors: formErrors })}
            <HelperText error={!!formErrors?.form}>{formErrors?.form}</HelperText>
          </>
        );
      },
    };
  }

  const editPasswordClickHandler = async () => {
    if (!customer) {
      return;
    }
    if (isSocialLogin && shouldAddPassword) {
      await accountController.resetPassword(customer.email, '');
      return navigate(modalURLFromLocation(location, 'add-password'));
    }

    navigate(modalURLFromLocation(location, canChangePasswordWithOldPassword ? 'edit-password' : 'reset-password'));
  };

  return (
    <>
      <h1 className={styles.hideUntilFocus}>{t('nav.account')}</h1>

      <Form initialValues={initialValues}>
        {[
          formSection({
            label: t('account.about_you'),
            editButton: t('account.edit_information'),
            onSubmit: async (values) => {
              if (!registrationFields) {
                throw new Error('Registration fields are not loaded');
              }
              await accountController.updateRegistrationFieldsValues(registrationFields, values.registrationFields);

              announce(t('account.update_success', { section: t('account.about_you') }), 'success');
            },
            content: (section) => (
              <>
                {registrationFields?.map((field) => (
                  <CustomRegisterField
                    key={field.name}
                    type={field.type}
                    name={`registrationFields.${field.name}`}
                    value={section.values.registrationFields[field.name] || ''}
                    onChange={section.onChange}
                    placeholder={field.placeholder}
                    disabled={!section.isEditing || section.isBusy}
                    label={field.label}
                    required={field.required}
                    options={field.options}
                    lang={htmlLang}
                  />
                ))}
              </>
            ),
          }),
          formSection({
            label: t('account.email'),
            onSubmit: async (values) => {
              await accountController.updateUser({
                email: values.updateEmail.email || '',
                confirmationPassword: values.updateEmail.confirmationPassword,
              });

              announce(t('account.update_success', { section: t('account.email') }), 'success');
            },
            canSave: (values) => !!(values.updateEmail.email && values.updateEmail.confirmationPassword),
            editButton: t('account.edit_account'),
            readOnly: !canUpdateEmail,
            content: (section) => (
              <>
                <TextField
                  name="updateEmail.email"
                  label={t('account.email')}
                  value={section.values.updateEmail?.email || ''}
                  onChange={section.onChange}
                  // @TODO after moving error handling to controller
                  // error={!!section.errors?.email}
                  // helperText={section.errors?.email}
                  disabled={section.isBusy}
                  editing={section.isEditing}
                  required
                />
                {section.isEditing && (
                  <TextField
                    name="updateEmail.confirmationPassword"
                    label={t('account.confirm_password')}
                    value={section.values.updateEmail.confirmationPassword}
                    onChange={section.onChange}
                    error={!!section.errors?.confirmationPassword}
                    helperText={section.errors?.confirmationPassword}
                    type={viewPassword ? 'text' : 'password'}
                    disabled={section.isBusy}
                    rightControl={
                      <IconButton aria-label={viewPassword ? t('account.hide_password') : t('account.view_password')} onClick={() => toggleViewPassword()}>
                        <Icon icon={viewPassword ? Visibility : VisibilityOff} />
                      </IconButton>
                    }
                    required
                  />
                )}
              </>
            ),
          }),
          formSection({
            label: t('account.security'),
            editButton: (
              <Button
                label={shouldAddPassword ? t('account.add_password') : t('account.edit_password')}
                type="button"
                onClick={() => (customer ? editPasswordClickHandler() : null)}
              />
            ),
          }),
          formSection({
            label: t('account.terms_and_tracking'),
            saveButton: t('account.update_consents'),
            onSubmit: async (values) => {
              await accountController.updateConsents(values.consents);

              announce(t('account.update_success', { section: t('account.terms_and_tracking') }), 'success');
            },
            content: (section) => (
              <>
                {consentsFields?.map((consent, index) => (
                  <Checkbox
                    key={index}
                    name={`consents.${consent.name}`}
                    checked={section.values.consents?.[consent.name]}
                    onChange={section.onChange}
                    label={formatConsentLabel(consent.label)}
                    disabled={consent.required || section.isBusy}
                    lang={htmlLang}
                  />
                ))}
              </>
            ),
          }),
          canExportAccountData &&
            formSection({
              label: t('account.export_data_title'),
              content: () => (
                <div className={styles.textWithButtonContainer}>
                  <div>
                    <Trans t={t} i18nKey="account.export_data_body" values={{ email: customer?.email || '' }} />
                  </div>
                  <div>
                    <Button
                      label={t('account.export_data_title')}
                      type="button"
                      disabled={exportData.isLoading}
                      onClick={async () => {
                        exportData.mutate();
                      }}
                    />
                  </div>
                </div>
              ),
            }),
          canDeleteAccount &&
            formSection({
              label: t('account.delete_account.title'),
              content: () => (
                <div className={styles.textWithButtonContainer}>
                  <div>{t('account.delete_account.body')}</div>
                  <div>
                    <Button
                      label={t('account.delete_account.title')}
                      type="button"
                      variant="danger"
                      onClick={() => {
                        navigate(modalURLFromLocation(location, shouldAddPassword ? 'warning-account-deletion' : 'delete-account'));
                      }}
                    />
                  </div>
                </div>
              ),
            }),
        ].filter(isTruthy)}
      </Form>
      {canExportAccountData && (
        <Alert open={isAlertVisible} message={exportDataMessage} onClose={() => setIsAlertVisible(false)} isSuccess={exportData.isSuccess} />
      )}
    </>
  );
};

export default Account;
