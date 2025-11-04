import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withInterceptors,
} from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { apolloOptions } from './graphql.config';
import { graphqlCsrfInterceptor } from './core/interceptors/graphql-csrf.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([graphqlCsrfInterceptor])
    ),
    provideApollo(apolloOptions),
  ],
};
