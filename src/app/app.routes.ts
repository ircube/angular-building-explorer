import { Routes } from '@angular/router';
// import { LandingComponent } from './pages/landing/landing.component';
import { Landing } from './pages/landing/landing';
import { Buildings } from './pages/buildings/buildings';
import { Viewer } from './pages/viewer/viewer';
import { Contact } from './pages/contact/contact';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: Landing },
  { path: 'buildings', component: Buildings },
  { path: 'viewer', component: Viewer },
  { path: 'contact', component: Contact },
];