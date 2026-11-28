import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { FavoritesState } from './core/states/favorites/favorites.state';
import { AuthState } from './store/auth.state';

// Dates and numbers formatted the French way by the pipes (date, number)
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: URL parameters (e.g. :id) are passed to the component @Inputs
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    // NGXS store. The "auth" and "favorites" states are saved in localStorage and restored at startup,
    // before the first navigation
    provideStore([AuthState, FavoritesState], withNgxsStoragePlugin({ keys: ['auth', 'favorites'] })),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
