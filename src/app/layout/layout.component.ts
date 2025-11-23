import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../theme.service';
import { I18nService } from '../i18n.service';
import { TranslatePipe } from '../i18n.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  private themeService = inject(ThemeService);
  public i18nService = inject(I18nService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  switchLanguage(lang: string): void {
    this.i18nService.setLocale(lang);
  }
}
