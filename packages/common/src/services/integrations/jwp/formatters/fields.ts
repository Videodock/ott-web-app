import type { RegisterField } from '@inplayer-org/inplayer.js';

import type { CustomFormField, CustomRegisterFieldVariant } from '../../../../../types/account';

export const formatRegistrationField = (field: RegisterField, value?: unknown): CustomFormField => {
  return {
    type: field.type as CustomRegisterFieldVariant,
    isCustomRegisterField: true,
    name: field.name,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    options: field.options,
    ...(field.type === 'checkbox'
      ? {
          enabledByDefault: typeof value === 'string' ? value === 'true' : field.default_value === 'true',
        }
      : {
          defaultValue: typeof value === 'string' ? value : field.default_value,
        }),
  };
};
