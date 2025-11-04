import { HttpInterceptorFn } from '@angular/common/http';

export const graphqlCsrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/graphql')) {
    const modified = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'apollo-require-preflight': 'true',
      },
    });
    return next(modified);
  }
  return next(req);
};
