import { cleanup, fireEvent } from '@testing-library/react';
import type { LanguageDefinition } from 'packages/common/types/i18n';

import { renderWithRouter } from '../../../test/utils';

import LanguageMenu from './LanguageMenu';

const languages = [
  { displayName: 'English', code: 'en' },
  { displayName: 'español', code: 'es' },
];

const onClickCb = vi.fn();
const openLanguageMenuCb = vi.fn();
const closeLanguageMenuCb = vi.fn();

describe('<LanguageMenu>', () => {
  afterEach(() => {
    onClickCb.mockClear();
    openLanguageMenuCb.mockClear();
    closeLanguageMenuCb.mockClear();
    cleanup();
  });

  const renderLanguageMenu = (currentLanguage: LanguageDefinition, languageMenuOpen: boolean) => {
    return renderWithRouter(
      <LanguageMenu
        languages={languages}
        currentLanguage={currentLanguage}
        onClick={onClickCb}
        languageMenuOpen={languageMenuOpen}
        openLanguageMenu={openLanguageMenuCb}
        closeLanguageMenu={closeLanguageMenuCb}
      />,
    );
  };

  test('renders and matches snapshot', () => {
    const { container } = renderLanguageMenu(languages[0], false);
    expect(container).toMatchSnapshot();
  });

  test('Renders the correct items in the LanguageMenu', () => {
    const { container } = renderLanguageMenu(languages[0], true);
    const languagePanel = container.querySelector('#language-panel');
    expect(languagePanel).toBeInTheDocument();

    const languageMenuItems = languagePanel?.querySelectorAll('li');

    expect(languageMenuItems).toHaveLength(languages.length);
    languages.forEach((lang, index) => {
      expect(languageMenuItems?.[index]).toHaveTextContent(lang.displayName);
    });
  });

  test('Check if the correct language item is selected onclick', () => {
    const { container } = renderLanguageMenu(languages[0], true);
    const languageMenuItems = container.querySelectorAll('#language-panel li');
    fireEvent.click(languageMenuItems[0]);
    expect(onClickCb).toHaveBeenCalledWith(languages[0].code);
  });

  test('Calls openLanguageCb when onClick is called and menu is closed', () => {
    const { getByRole } = renderLanguageMenu(languages[0], false);
    const languageMenuButton = getByRole('button');
    fireEvent.click(languageMenuButton);
    expect(openLanguageMenuCb).toHaveBeenCalled();
  });

  test('Calls closeLanguageMenuCb when onClick is called and menu is open', () => {
    const { getByRole } = renderLanguageMenu(languages[0], true);
    const languageMenuButton = getByRole('button');
    fireEvent.click(languageMenuButton);
    expect(closeLanguageMenuCb).toHaveBeenCalled();
  });
});
