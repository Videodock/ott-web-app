import type { CleengCaptureField, CleengCaptureQuestionField, UpdateCaptureAnswersPayload } from '../types/models';
import type { CustomFormField, CustomRegisterFieldVariant } from '../../../../../types/account';

export const formatFormField = (
  type: CustomRegisterFieldVariant,
  name: string,
  label: string,
  required: boolean = false,
  options?: Record<string, string>,
): CustomFormField => {
  return {
    type,
    name,
    label,
    options,
    required,
    placeholder: '',
    defaultValue: '',
  };
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
      return [formatFormField('input', 'firstName', 'First name', capture.required), formatFormField('input', 'lastName', 'Last name', capture.required)];
    case 'address':
      return [
        formatFormField('input', 'address', 'Address', capture.required),
        formatFormField('input', 'address2', 'Address line 2'),
        formatFormField('input', 'city', 'City', capture.required),
        formatFormField('input', 'postCode', 'Postal code', capture.required),
        formatFormField('input', 'state', 'State', capture.required),
      ];
    case 'birthDate':
      return [formatFormField('datepicker', 'birthdate', 'Birthdate')];
    default:
      // question field (has a data different structure)
      if ('question' in capture) {
        const options = capture.value.split(';').reduce((values, question) => {
          const [value, label = value] = question.split(':');

          return { ...values, [value]: label };
        }, {} as Record<string, string>);

        const type = getInputTypeFromCaptureValue(capture.value, options);

        return [formatFormField(type, capture.key, capture.question, capture.required, options)];
      }

      // generic capture fields
      return [formatFormField('input', capture.key, 'IDK')];
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

export const formatUpdateCaptureAnswersPayload = (fields: CustomFormField[], values: Record<string, string>): UpdateCaptureAnswersPayload => {
  return fields.reduce((previous, current) => {
    const key = current.name;
    const value = values[current.name];

    if (CLEENG_CAPTURE_FIELDS.includes(key)) {
      return { ...previous, [key as keyof UpdateCaptureAnswersPayload]: value };
    }

    return {
      ...previous,
      customAnswers: [...(previous.customAnswers || []), { questionId: key, question: current.label, value: value }],
    };
  }, {} as UpdateCaptureAnswersPayload);
};
