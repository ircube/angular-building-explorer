import { createStore } from 'zustand/vanilla';

export interface I18nState {
  locale: string;
  translations: any;
  setLocale: (locale: string) => void;
  setTranslations: (translations: any) => void;
}

export const i18nStore = createStore<I18nState>((set) => ({
  locale: 'en',
  translations: {},
  setLocale: (locale: string) => set({ locale }),
  setTranslations: (translations: any) => set({ translations }),
}));
