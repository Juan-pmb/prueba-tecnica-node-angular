import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login)
  },

  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OPERADOR', 'CONSULTA'] }
      },

      {
        path: 'imports',
        loadComponent: () =>
          import('./features/imports/imports').then((m) => m.Imports),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OPERADOR'] }
      },

      {
        path: 'records',
        loadComponent: () =>
          import('./features/records/records').then((m) => m.Records),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OPERADOR', 'CONSULTA'] }
      },

      {
        path: 'errors',
        loadComponent: () =>
          import('./features/errors/errors').then(
            (m) => m.Errors
          ),
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'OPERADOR', 'CONSULTA']
        }
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then((m) => m.Reports),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'OPERADOR', 'CONSULTA'] }
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users').then((m) => m.Users),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];