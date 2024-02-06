import React from 'react';
import { object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { RegistrationFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { formatConsentsFromValues } from '@jwp/ott-common/src/utils/collection';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useQuery } from 'react-query';

import RegistrationForm from '../../../components/RegistrationForm/RegistrationForm';

const Registration = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');

  useQuery(['registrationFields'], accountController.getRegistrationFields);
  useQuery(['consents'], accountController.getConsents);

  const { consents, registrationFields, loading } = useAccountStore(({ consents, registrationFields, loading }) => ({ consents, registrationFields, loading }));

  const { handleSubmit, handleChange, handleBlur, values, errors, submitting } = useForm<RegistrationFormData>({
    initialValues: { email: '', password: '', registrationFields: {}, consents: {} },
    validationSchema: object().shape({
      email: string().email(t('registration.field_is_not_valid_email')).required(t('registration.field_required')),
      password: string()
        .matches(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, t('registration.invalid_password'))
        .required(t('registration.field_required')),
      registrationFields: object(),
      consents: object(),
    }),
    validateOnBlur: true,
    onSubmit: ({ email, password, consents: consentsValues, registrationFields: registrationFieldValues }) =>
      accountController.register(email, password, window.location.href, formatConsentsFromValues(consents, consentsValues), registrationFieldValues),
    onSubmitSuccess: () => navigate(modalURLFromLocation(location, 'personal-details')),
    onSubmitError: ({ resetValue }) => resetValue('password'),
  });

  return (
    <RegistrationForm
      onSubmit={handleSubmit}
      onChange={handleChange}
      onBlur={handleBlur}
      values={values}
      errors={errors}
      submitting={submitting}
      consents={consents}
      registrationFields={registrationFields}
      loading={loading}
      canSubmit={true}
    />
  );
};

export default Registration;
