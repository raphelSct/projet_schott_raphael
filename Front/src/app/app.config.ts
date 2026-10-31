import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

// Dates and numbers formatted the French way by the pipes (date, number)
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: URL parameters (e.g. :id) are passed to the component @Inputs
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
