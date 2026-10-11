import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
