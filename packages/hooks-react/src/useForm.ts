import { useCallback, useState } from 'react';
import { type AnySchema, ValidationError, SchemaOf } from 'yup';
import type { FormErrors, GenericFormNestedValues, UseFormBlurHandler, UseFormChangeHandler, UseFormSubmitHandler } from '@jwp/ott-common/types/form';
import { FormValidationError } from '@jwp/ott-common/src/FormValidationError';
import { useTranslation } from 'react-i18next';

export type UseFormReturnValue<T> = {
  values: T;
  errors: FormErrors<T>;
  submitting: boolean;
  handleChange: UseFormChangeHandler;
  handleBlur: UseFormBlurHandler;
  handleSubmit: UseFormSubmitHandler;
  setValue: (key: string, value: string | boolean) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
};

type UseFormMethods<T> = {
  setValue: (key: string, value: string | boolean) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  validate: (validationSchema: AnySchema) => boolean;
};

export type UseFormOnSubmitHandler<T> = (values: T, formMethods: UseFormMethods<T>) => void;

export const updateNestedValue = <T extends Record<string, unknown>>(current: T, name: string, value: string | boolean) => {
  // This logic handles nested names like 'consents.terms'
  const [nestedKey, fieldName] = name.split('.');
  const nestedValue = current[nestedKey];

  if (fieldName && nestedValue && typeof nestedValue === 'object') {
    return { ...current, [nestedKey]: { ...nestedValue, [fieldName]: value } };
  }

  return { ...current, [name]: value };
};

export default function useForm<T extends GenericFormNestedValues>({
  initialValues,
  validationSchema,
  validateOnBlur = false,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
}: {
  initialValues: T;
  validationSchema?: SchemaOf<T>;
  validateOnBlur?: boolean;
  onSubmit: UseFormOnSubmitHandler<T>;
  onSubmitSuccess?: (values: T) => void;
  onSubmitError?: ({ error, resetValue }: { error: unknown; resetValue: (key: string) => void }) => void;
}): UseFormReturnValue<T> {
  const { t } = useTranslation('error');
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.fromEntries((Object.keys(initialValues) as Array<keyof T>).map((key) => [key, false])) as Record<keyof T, boolean>,
  );
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitting(false);
    setTouched(Object.fromEntries((Object.keys(initialValues) as Array<keyof T>).map((key) => [key, false])) as Record<keyof T, boolean>);
  }, [initialValues]);

  const validateField = (name: string, formValues: T) => {
    if (!validationSchema) return;

    try {
      // @todo this fails because dynamic fields are not known by the validation schema...
      validationSchema.validateSyncAt(name, formValues, { strict: true, stripUnknown: true });
      // clear error
      setErrors((errors) => ({ ...errors, [name]: undefined }));
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const errorMessage = error.errors[0];
        setErrors((errors) => ({ ...errors, [name]: errorMessage }));
      }
    }
  };

  const setValue = useCallback((name: string, value: string | boolean) => {
    setValues((current) => updateNestedValue(current, name, value));
  }, []);

  const handleChange: UseFormChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target instanceof HTMLInputElement && event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const updatedValues = updateNestedValue(values, name, value);

    setValues(updatedValues);
    setTouched((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      validateField(name, updatedValues);
    }
  };

  const handleBlur: UseFormBlurHandler = (event) => {
    if (!validateOnBlur || !touched[event.target.name]) return;

    validateField(event.target.name, values);
  };

  const validate = (validationSchema: AnySchema) => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });

      return true;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const newErrors: Record<string, string> = {};

        for (let index = 0; index < error.inner.length; index++) {
          const path = error.inner[index].path as string;
          const message = error.inner[index].errors[0] as string;

          if (path && message && !newErrors[path]) {
            newErrors[path] = message;
          }
        }

        setErrors(newErrors as FormErrors<T>);
      }
    }

    return false;
  };

  const handleSubmit: UseFormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!onSubmit || submitting) return;

    // reset errors before submitting
    setErrors({});

    // validate values with schema
    if (validationSchema && !validate(validationSchema)) {
      return;
    }

    // start submitting
    setSubmitting(true);

    try {
      await onSubmit(values, { setValue, setErrors, setSubmitting, validate });
      onSubmitSuccess?.(values);
    } catch (error: unknown) {
      const newErrors: Record<string, string> = {};

      if (error instanceof FormValidationError) {
        Object.entries(error.errors).forEach(([key, value]) => {
          if (key && value && !newErrors[key]) {
            newErrors[key] = value;
          }
        });
      } else if (error instanceof Error) {
        newErrors.form = error.message;
      } else {
        newErrors.form = t('unknown_error');
      }
      setErrors(newErrors as FormErrors<T>);

      onSubmitError?.({
        error,
        resetValue: (key: string) => setValue(key, ''),
      });
    }

    setSubmitting(false);
  };

  return { values, errors, handleChange, handleBlur, handleSubmit, submitting, setValue, setErrors, setSubmitting, reset };
}
