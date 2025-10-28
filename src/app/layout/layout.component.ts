import { Component, inject } from '@angular/core';
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
  private document = inject<Document>(DOCUMENT);

  private themeService = inject(ThemeService);
  private router = inject(Router); // Inject DOCUMENT


  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  switchLanguage(lang: string): void {
    const currentPath = this.router.url; // e.g., "/en/landing", "/es", "/"

    let pathWithoutLangPrefix: string;

    // Check if the current path starts with a known language prefix
    if (currentPath.startsWith('/en/') || currentPath === '/en') {
      pathWithoutLangPrefix = currentPath.substring(3); // Remove "/en" or "/en/"
    } else if (currentPath.startsWith('/es/') || currentPath === '/es') {
      pathWithoutLangPrefix = currentPath.substring(3); // Remove "/es" or "/es/"
    } else {
      // If no language prefix, use the path as is (e.g., for the root of the default language)
      pathWithoutLangPrefix = currentPath;
    }

    // Ensure pathWithoutLangPrefix starts with a '/' if it's not empty
    if (pathWithoutLangPrefix === '') {
      pathWithoutLangPrefix = '/'; // If it was just '/en' or '/es', it becomes '/'
    } else if (!pathWithoutLangPrefix.startsWith('/')) {
      pathWithoutLangPrefix = '/' + pathWithoutLangPrefix;
    }

    // Construct the new URL with the desired language prefix
    const targetUrl = `/${lang}${pathWithoutLangPrefix}`;

    // Trigger a full page reload to the new URL
    this.document.location.href = targetUrl;
  }
}
