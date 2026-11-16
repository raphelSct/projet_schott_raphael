import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

// Every page is lazy loaded: its code is only downloaded when the user first opens it
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  // Visitors only: a logged-in user is sent to the application (guestGuard)
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login),
    title: 'Connexion',
  },
  {
    path: 'signup',
    canMatch: [guestGuard],
    loadComponent: () => import('./signup/signup').then((m) => m.Signup),
    title: 'Inscription',
  },
  // Logged-in users only: canMatch (authGuard) also keeps the code of these pages from being downloaded otherwise
  {
    path: 'pollutions',
    canMatch: [authGuard],
    loadChildren: () => import('./pollutions/pollutions.routes').then((m) => m.POLLUTION_ROUTES),
  },
  {
    path: 'users',
    canMatch: [authGuard],
    loadComponent: () => import('./users/user-list/user-list').then((m) => m.UserList),
    title: 'Utilisateurs inscrits',
  },
  { path: '**', redirectTo: 'pollutions' },
];
