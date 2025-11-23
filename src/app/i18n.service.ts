import { Injectable } from '@angular/core';
import { i18nStore } from './stores/i18n.store';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private store = i18nStore;

  constructor() {
    this.loadTranslations(this.store.getState().locale);
  }

  async setLocale(locale: string) {
    await this.loadTranslations(locale);
    this.store.getState().setLocale(locale);
  }

  get locale() {
    return this.store.getState().locale;
  }

  translate(key: string): string {
    const keys = key.split('.');
    let result = this.store.getState().translations;
    for (const k of keys) {
      result = result[k];
      if (!result) {
        return key;
      }
    }
    return result;
  }

  private async loadTranslations(locale: string) {
    try {
      const translations = await import(`../assets/i18n/${locale}.json`);
      this.store.getState().setTranslations(translations.default);
    } catch (error) {
      console.error(`Failed to load translations for locale: ${locale}`, error);
      // Fallback to English if the desired locale fails
      if (locale !== 'en') {
        await this.loadTranslations('en');
        this.store.getState().setLocale('en');
      }
    }
  }
}
