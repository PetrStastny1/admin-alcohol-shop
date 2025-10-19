import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const authLink = new ApolloLink((operation, forward) => {
        const token = localStorage.getItem('token');
        operation.setContext(({ headers = {} }) => {
          return {
            headers: {
              ...headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          };
        });
        return forward(operation);
      });

      return {
        link: authLink.concat(
          httpLink.create({ uri: 'http://localhost:3000/graphql' })
        ),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
          query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
          mutate: {
            errorPolicy: 'all',
          },
        },
      };
    }),
  ],
};
