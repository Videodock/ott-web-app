import { render } from '@testing-library/react';
import type { CustomFormField } from '@jwp/ott-common/types/account';

import PersonalDetailsForm from './PersonalDetailsForm';

const noop = () => {
  /**/
};
const values = {
  firstName: 'Vince',
  lastName: 'Guy',
  birthDate: '27-Feb-1985',
  companyName: 'JW Player',
  phoneNumber: '+1 555 555 5555',
};
const fields: CustomFormField[] = [
  {
    type: 'input',
    name: 'firstName',
    label: 'First name',
    placeholder: '',
    required: true,
    defaultValue: '',
  },
  {
    type: 'input',
    name: 'lastName',
    label: 'Last name',
    placeholder: '',
    required: true,
    defaultValue: '',
  },
  {
    type: 'input',
    name: 'companyName',
    label: 'Company name',
    placeholder: '',
    required: false,
    defaultValue: '',
  },
  {
    type: 'datepicker',
    name: 'birthDate',
    label: 'Birth date',
    placeholder: '',
    required: false,
    defaultValue: '',
  },
  {
    type: 'input',
    name: 'phoneNumber',
    label: 'Phone Number',
    placeholder: '',
    required: false,
    defaultValue: '',
  },
  {
    type: 'input',
    name: 'custom_1',
    label: 'This is a text field',
    placeholder: '',
    required: false,
    defaultValue: '',
  },
  {
    type: 'checkbox',
    name: 'custom_2',
    label: 'This is a checkbox field',
    options: { accept: 'accept' },
    placeholder: '',
    required: false,
    enabledByDefault: false,
  },
  {
    type: 'radio',
    name: 'custom_3',
    label: 'This is a radio field',
    options: { option1: 'Option 1', option2: 'Option 2' },
    placeholder: '',
    required: true,
    defaultValue: '',
  },
  {
    type: 'select',
    name: 'custom_4',
    label: 'This is a select field',
    options: { option1: 'Option 1', option2: 'Option 2', option3: 'Option 3' },
    placeholder: '',
    required: true,
    defaultValue: '',
  },
];

describe('<PersonalDetailsForm>', () => {
  test('Renders without crashing', () => {
    const { container } = render(<PersonalDetailsForm onSubmit={noop} onChange={noop} errors={{}} values={values} submitting={false} fields={fields} />);

    expect(container).toMatchSnapshot();
  });

  test('Renders with errors', () => {
    const { container } = render(
      <PersonalDetailsForm
        onSubmit={noop}
        onChange={noop}
        errors={{
          firstName: 'this is wrong',
          lastName: 'also this',
          birthDate: 'February 30th? Really?',
          phoneNumber: 'Invalid',
          custom_1: 'Please enter some text',
          custom_2: 'Check this box please!',
          custom_3: "It's only two choices",
          custom_4: 'Select something...',
          form: 'This is a form error',
        }}
        values={values}
        submitting={false}
        fields={fields}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
