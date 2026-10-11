import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Adds the API key and response language to every request sent to TMDb. */
export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl, apiKey, language } = environment.tmdb;

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  return next(
    req.clone({
      setParams: { api_key: apiKey, language },
    }),
  );
};
