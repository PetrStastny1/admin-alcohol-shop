import { inject } from '@angular/core';
import {
  InMemoryCache,
  ApolloLink,
  ApolloClientOptions,
  DefaultOptions,
} from '@apollo/client/core';
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

  console.log('Apollo client initializing...');
  console.log('GraphQL URI:', graphqlUri);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-apollo-operation-name': operation.operationName || 'unknown',
      'apollo-require-preflight': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    operation.setContext({
      headers,
      method: 'POST',
      useGETForQueries: false,
    });

    return forward(operation);
  });

  const link = ApolloLink.from([
    authLink,
    httpLink.create({
      uri: graphqlUri,
      withCredentials: false,
      includeExtensions: true,
    }),
  ]);

  return {
    link,
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
