import { Component, signal } from '@angular/core';
import { LayoutComponent } from './layout/layout.component'; // Import LayoutComponent

@Component({
  selector: 'app-root',
  standalone: true, // Add standalone: true
  imports: [LayoutComponent], // Remove RouterOutlet from imports
  template: '<app-layout></app-layout>', // Use the layout component
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('angular-building-explorer');
}
