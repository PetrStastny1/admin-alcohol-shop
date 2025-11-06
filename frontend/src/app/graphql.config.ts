import { inject } from '@angular/core';
import { InMemoryCache, ApolloLink, ApolloClientOptions, DefaultOptions } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

const defaultOptions: DefaultOptions = {
  watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  mutate: { errorPolicy: 'all' },
};

export function apolloOptions(): ApolloClientOptions {
  const httpLink = inject(HttpLink);

  const graphqlUri = environment.graphqlUri.startsWith('http')
    ? environment.graphqlUri
    : `${environment.apiUrl}${environment.graphqlUri}`;

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token') ?? null;

    operation.setContext((prev: { headers?: HttpHeaders | Record<string, string> } = {}) => {
      const base =
        prev.headers instanceof HttpHeaders
          ? prev.headers
          : new HttpHeaders(prev.headers ?? {});

      let headers = base
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('x-apollo-operation-name', operation.operationName || 'unknown');

      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      return { headers };
    });

    return forward(operation);
  });

  const link = ApolloLink.from([
    authLink,
    httpLink.create({
      uri: graphqlUri,
      withCredentials: false,
      includeExtensions: false,
    }),
  ]);

  return {
    link,
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
