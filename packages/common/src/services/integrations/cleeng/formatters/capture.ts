import type { CleengCaptureField, CleengCaptureQuestionField, UpdateCaptureAnswersPayload } from '../types/models';
import type { CustomFormField, CustomRegisterFieldVariant } from '../../../../../types/account';
import type { GenericFormValues } from '../../../../../types/form';
import { isTruthyCustomParamValue } from '../../../../utils/common';

export const getCaptureValue = (capture: CleengCaptureField | CleengCaptureQuestionField, key: string): string => {
  if (typeof capture.answer === 'string') {
    return capture.answer;
  }

  if (capture.answer && key in capture.answer) {
    return capture.answer[key] || '';
  }

  return '';
};

export const formatFormField = (
  type: CustomRegisterFieldVariant,
  name: string,
  label: string,
  capture: CleengCaptureField | CleengCaptureQuestionField,
  options?: Record<string, string>,
): CustomFormField => {
  const value = getCaptureValue(capture, name);

  return {
    type,
    name,
    label,
    options,
    placeholder: '',
    required: capture.required,
    ...(type === 'checkbox' ? { enabledByDefault: isTruthyCustomParamValue(capture.answer) } : { defaultValue: value }),
  };
};

export const getInputOptionsFromCaptureValue = (value: string) => {
  return value.split(';').reduce((values, question) => {
    const [value, label = value] = question.split(':');

    return { ...values, [value]: label };
  }, {} as Record<string, string>);
};

export const getInputTypeFromCaptureValue = (value: string, questions: Record<string, string>): CustomRegisterFieldVariant => {
  const optionsCount = Object.keys(questions).length;

  if (value === '') {
    return 'input'; // text
  } else if (optionsCount === 1) {
    return 'checkbox';
  } else if (optionsCount === 2) {
    return 'radio';
  }

  return 'select';
};

export const formatCapture = (capture: CleengCaptureField | CleengCaptureQuestionField): CustomFormField[] => {
  switch (capture.key) {
    case 'firstNameLastName':
      return [formatFormField('input', 'firstName', 'First name', capture), formatFormField('input', 'lastName', 'Last name', capture)];
    case 'address':
      return [
        formatFormField('input', 'address', 'Address', capture),
        formatFormField('input', 'address2', 'Address line 2', capture),
        formatFormField('input', 'city', 'City', capture),
        formatFormField('input', 'postCode', 'Postal code', capture),
        formatFormField('input', 'state', 'State', capture),
      ];
    case 'birthDate':
      return [formatFormField('datepicker', 'birthdate', 'Birthdate', capture)];
    default:
      // question field (has a data different structure)
      if ('question' in capture) {
        const options = getInputOptionsFromCaptureValue(capture.value);
        const type = getInputTypeFromCaptureValue(capture.value, options);

        return [formatFormField(type, capture.key, capture.question, capture, options)];
      }

      // generic capture fields
      return [formatFormField('input', capture.key, capture.key, capture)];
  }
};

const CLEENG_CAPTURE_FIELDS = [
  'firstName',
  'lastName',
  'address',
  'address2',
  'city',
  'state',
  'country',
  'postCode',
  'birthDate',
  'companyName',
  'phoneNumber',
];

export const formatUpdateCaptureAnswersPayload = (fields: CustomFormField[], values: GenericFormValues): UpdateCaptureAnswersPayload => {
  return fields.reduce((previous, current) => {
    const key = current.name;
    const value = values[current.name];

    if (CLEENG_CAPTURE_FIELDS.includes(key)) {
      if (typeof value !== 'string') {
        // capture fields should only accept string values
        throw new Error(`Wrong value for registration field ${key}: ${value}`);
      }

      return { ...previous, [key as keyof UpdateCaptureAnswersPayload]: value };
    }

    // checkbox value is a boolean, we turn it into a string here with 'true' or 'false'
    const stringValue = typeof value === 'string' ? value : value ? 'true' : 'false';

    return {
      ...previous,
      customAnswers: [
        ...(previous.customAnswers || []),
        {
          questionId: key,
          question: current.label,
          value: stringValue,
        },
      ],
    };
  }, {} as UpdateCaptureAnswersPayload);
};
