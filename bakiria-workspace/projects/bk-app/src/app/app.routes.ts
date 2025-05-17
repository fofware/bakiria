import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent() {
      return import('./components/dashboard/dashboard.component').then(
        (mod) => mod.DashboardComponent
      );
    },
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./components/auth/routes').then((mod) => mod.routes),
  },
];
