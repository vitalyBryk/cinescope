import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeRu from '@angular/common/locales/ru';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { tmdbInterceptor } from './core/interceptors/tmdb.interceptor';

// Russian date and number formats for DatePipe / DecimalPipe
registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([tmdbInterceptor])),
    { provide: LOCALE_ID, useValue: 'ru' },
  ]
};
