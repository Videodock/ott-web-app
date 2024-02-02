import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQuery } from 'react-query';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';
import type { GenericFormValues } from '@jwp/ott-common/types/form';
import { FormValidationError } from '@jwp/ott-common/src/FormValidationError';

import PersonalDetailsForm from '../../../components/PersonalDetailsForm/PersonalDetailsForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';

const PersonalDetails = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const accessModel = useConfigStore((s) => s.accessModel);
  const { data, isLoading } = useQuery('captureStatus', accountController.getRegistrationFields);
  const { hasMediaOffers } = useOffers();

  const fields = useMemo(() => data?.fields || [], [data]);

  const nextStep = useCallback(() => {
    const hasOffers = accessModel === ACCESS_MODEL.SVOD || (accessModel === ACCESS_MODEL.AUTHVOD && hasMediaOffers);

    navigate(modalURLFromLocation(location, hasOffers ? 'choose-offer' : 'welcome'), { replace: true });
  }, [navigate, location, accessModel, hasMediaOffers]);

  useEffect(() => {
    if (data && (!data.enabled || data.beforeSignUp)) nextStep();
  }, [data, nextStep]);

  const initialValues: Record<string, string> = {};

  const PersonalDetailSubmitHandler: UseFormOnSubmitHandler<GenericFormValues> = async (formData, { setErrors, setSubmitting }) => {
    try {
      await accountController.updateRegistrationFieldsValues(fields, formData);
      nextStep();
    } catch (error: unknown) {
      if (error instanceof FormValidationError) {
        setErrors(error.errors);
      } else {
        setErrors({ form: 'Something went wrong...' });
      }
    }

    setSubmitting(false);
  };

  const { setValue, handleSubmit, handleChange, values, errors, submitting } = useForm<GenericFormValues>({
    initialValues,
    onSubmit: PersonalDetailSubmitHandler,
  });

  useEffect(() => {
    fields.forEach((field) => {
      setValue(field.name, field.type === 'checkbox' ? !!field.enabledByDefault : field.defaultValue || '');
    });
  }, [fields, setValue]);

  if (isLoading) {
    return (
      <div style={{ height: 400 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return <PersonalDetailsForm fields={fields} onSubmit={handleSubmit} onChange={handleChange} values={values} errors={errors} submitting={submitting} />;
};

export default PersonalDetails;
