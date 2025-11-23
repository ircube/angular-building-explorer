import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { I18nService } from './i18n.service';
import { i18nStore } from './stores/i18n.store';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // This is important for the pipe to update when the locale changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef) {
    // Subscribe to store changes to mark for check
    i18nStore.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    return this.i18nService.translate(key);
  }
}
