import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { mockPollutionsInterceptor } from './interceptors/mock-pollutions.interceptor';
import { mockUsersInterceptor } from './interceptors/mock-users.interceptor';

// Dates and numbers formatted the French way by the pipes (date, number)
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: URL parameters (e.g. :id) are passed to the component @Inputs
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors(environment.mockApi ? [mockUsersInterceptor, mockPollutionsInterceptor] : [])),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
