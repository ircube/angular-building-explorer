// src/app/i18n.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { useI18nStore } from './stores/i18n.store';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translations: any = {};
  private translationsLoaded = new BehaviorSubject<boolean>(false);
  public translationsLoaded$ = this.translationsLoaded.asObservable();

  currentLanguage = signal<'en' | 'es'>(useI18nStore.getState().currentLanguage);

  constructor(private http: HttpClient) {
    useI18nStore.subscribe((state) => {
      const newLanguage = state.currentLanguage;
      if (this.currentLanguage() !== newLanguage) {
        this.currentLanguage.set(newLanguage);
        this.loadTranslations(newLanguage).subscribe();
      }
    });

    // Initial load
    this.loadTranslations(this.currentLanguage()).subscribe();
  }

  loadTranslations(language: 'en' | 'es'): Observable<any> {
    return this.http.get(`./assets/i18n/${language}.json`).pipe(
      tap(data => {
        this.translations = data;
        this.translationsLoaded.next(true);
      })
    );
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }

  setLanguage(language: 'en' | 'es') {
    useI18nStore.getState().setLanguage(language);
  }
}
