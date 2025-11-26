import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      {
        path: 'landing',
        loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent)
      },
      {
        path: 'buildings',
        loadComponent: () => import('./pages/buildings/buildings').then(m => m.BuildingsComponent)
      },
      {
        path: 'viewer',
        loadComponent: () => import('./pages/viewer/viewer').then(m => m.ViewerComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' } // Redirect any unfound routes to the base path
];
