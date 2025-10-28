import { Component, inject, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common'; // Import CommonModule and DOCUMENT
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router'; // Import Router
import { ThemeService } from '../theme.service'; // Import ThemeService

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private themeService = inject(ThemeService);
  private router = inject(Router); // Inject Router
  constructor(@Inject(DOCUMENT) private document: Document) {} // Inject DOCUMENT


  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  changeLanguage(lang: string): void {
    const currentUrl = this.router.url;
    const newUrl = `/${lang}${currentUrl.startsWith('/en-US') || currentUrl.startsWith('/es') ? currentUrl.substring(currentUrl.indexOf('/', 1)) : currentUrl}`;
    this.document.location.href = newUrl;
  }
}
