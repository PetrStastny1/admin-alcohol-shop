import { inject } from '@angular/core';
import {
  ApolloLink,
  InMemoryCache,
  DefaultOptions
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';

const defaultOptions: DefaultOptions = {
  watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  mutate: { errorPolicy: 'all' },
};

export function apolloOptions() {
  const httpLink = inject(HttpLink);

  const graphqlUri = environment.graphqlUri.startsWith('http')
    ? environment.graphqlUri
    : `${environment.apiUrl}${environment.graphqlUri}`;

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    operation.setContext((prev: any) => ({
      ...prev,
      headers: {
        ...(prev?.headers || {}),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-apollo-operation-name': operation.operationName || 'unknown',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    return forward(operation);
  });

  const http = httpLink.create({
    uri: graphqlUri,
    withCredentials: false,
  });

  return {
    link: authLink.concat(http),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
