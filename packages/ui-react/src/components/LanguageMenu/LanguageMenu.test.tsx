import React from 'react';
import { fireEvent } from '@testing-library/react';

import { renderWithRouter } from '../../../test/utils';

import LanguageMenu from './LanguageMenu';

const languages = [
  {
    displayName: 'English',
    code: 'en',
  },
  {
    displayName: 'español',
    code: 'es',
  },
];

describe('<LanguageMenu>', () => {
  test('renders and matches snapshot', () => {
    const currentLanguage = languages[1];
    const { container } = renderWithRouter(<LanguageMenu languages={languages} currentLanguage={currentLanguage} onClick={() => undefined} />);

    expect(container).toMatchSnapshot();
  });

  test('shows all languages in the menu when button is clicked and calls the onClick callback with the correct language code', () => {
    const currentLanguage = languages[1];
    const callback = vi.fn();

    const { getByRole, container } = renderWithRouter(<LanguageMenu languages={languages} currentLanguage={currentLanguage} onClick={callback} />);
    const languageMenuButton = getByRole('button');

    // Simulate button click for accessiblity
    fireEvent.click(languageMenuButton);
    const languagePanel = container.querySelector('#language-panel');
    expect(languagePanel).toBeInTheDocument();

    const languageMenuItems = languagePanel?.querySelectorAll('li');
    expect(languageMenuItems).toHaveLength(languages.length);

    // check if all languages are displayed correctly
    languages.forEach((lang, index) => {
      expect(languageMenuItems?.[index]).toHaveTextContent(lang.displayName);
    });

    // ignore line since the value is hardcoded above.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(languageMenuItems![0]);
    expect(callback).toHaveBeenCalledWith(languages[0].code);
  });
});
