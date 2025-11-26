// src/app/stores/i18n.store.ts
import { createStore as create } from 'zustand/vanilla';

interface I18nState {
  currentLanguage: 'en' | 'es';
  setLanguage: (language: 'en' | 'es') => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  currentLanguage: 'en', // Default language
  setLanguage: (language) => set({ currentLanguage: language }),
}));
