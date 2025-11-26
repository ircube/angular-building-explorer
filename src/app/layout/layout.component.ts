// src/app/layout/layout.component.ts
import { Component, OnInit, WritableSignal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../i18n.service';
import { I18nPipe } from '../i18n.pipe';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, I18nPipe],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit { // Implement AfterViewInit
  @ViewChild('headerElement') headerElement!: ElementRef; // Reference to the header element

  currentLanguage: WritableSignal<'en' | 'es'>;
  isDarkTheme: WritableSignal<boolean>;

  constructor(
    private i18nService: I18nService,
    private themeService: ThemeService
  ) {
    this.currentLanguage = this.i18nService.currentLanguage;
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  ngOnInit(): void {
    // Optionally, any initialization logic
  }

  ngAfterViewInit(): void {
    this.updateHeaderHeight();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateHeaderHeight();
  }

  private updateHeaderHeight(): void {
    if (this.headerElement) {
      const headerHeight = this.headerElement.nativeElement.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }

  setLanguage(language: 'en' | 'es'): void {
    this.i18nService.setLanguage(language);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
