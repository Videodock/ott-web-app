import { createStore } from './utils';

type UIState = {
  searchQuery: string;
  searchActive: boolean;
  userMenuOpen: boolean;
  languageMenuOpen: boolean;
  preSearchPage?: string;
};

export const useUIStore = createStore<UIState>('UIStore', () => ({
  searchQuery: '',
  searchActive: false,
  languageMenuOpen: false,
  userMenuOpen: false,
}));
