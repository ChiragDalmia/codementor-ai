import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      {
        path: 'landing',
        loadComponent: () =>
          import('./features/landing/landing.component').then(m => m.LandingComponent),
        title: 'CodeMentor AI — Intelligent Code Review',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — CodeMentor AI',
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./features/review/review.component').then(m => m.ReviewComponent),
        title: 'Review Code — CodeMentor AI',
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then(m => m.HistoryComponent),
        title: 'Review History — CodeMentor AI',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings — CodeMentor AI',
      },
    ],
  },
  { path: '**', redirectTo: 'landing' },
];
