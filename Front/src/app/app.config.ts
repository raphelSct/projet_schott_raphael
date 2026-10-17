import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { apiSimuleeInterceptor } from './interceptors/api-simulee.interceptor';

// Dates et nombres formatés à la française par les pipes (date, number)
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors(environment.apiSimulee ? [apiSimuleeInterceptor] : [])),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
