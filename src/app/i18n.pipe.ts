// src/app/i18n.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true, // Assuming a standalone component setup
  pure: false // Important for re-evaluating when language changes
})
export class I18nPipe implements PipeTransform {

  constructor(private i18nService: I18nService) {}

  transform(key: string): Observable<string> {
    // Return an observable that emits the translated string
    // This allows the pipe to react to language changes
    return this.i18nService.translationsLoaded$.pipe(
      startWith(false), // Emit initial state
      map(() => this.i18nService.translate(key))
    );
  }
}
