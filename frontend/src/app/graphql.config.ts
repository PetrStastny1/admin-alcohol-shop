import { inject } from '@angular/core';
import {
  InMemoryCache,
  ApolloLink,
  ApolloClientOptions,
  DefaultOptions,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
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

  console.log('🚀 Apollo client initializing...');
  console.log('✅ Environment:', environment);
  console.log('✅ GraphQL URI:', graphqlUri);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    operation.setContext(({
      headers,
    }: {
      headers?: Headers | Record<string, string> | null;
    }) => {
      const safeHeaders: Record<string, string> = {};

      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          safeHeaders[key] = value;
        });
      } else if (typeof headers === 'object' && headers !== null) {
        Object.assign(safeHeaders, headers);
      }

      safeHeaders['Content-Type'] = 'application/json';
      safeHeaders['x-apollo-operation-name'] = operation.operationName || 'unknown';
      safeHeaders['apollo-require-preflight'] = 'true';
      if (token) safeHeaders['Authorization'] = `Bearer ${token}`;

      return { headers: safeHeaders };
    });

    return forward(operation);
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
