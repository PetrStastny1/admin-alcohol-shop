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

  const graphqlUri = environment.graphqlUri;

  console.log('🚀 Apollo client initializing...');
  console.log('✅ Environment:', environment);
  console.log('✅ GraphQL URI:', graphqlUri);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    operation.setContext((context?: { headers?: Record<string, string> }) => {
      const safeHeaders: Record<string, string> =
        typeof context?.headers === 'object' && context.headers !== null
          ? { ...context.headers }
          : {};

      if (token) {
        safeHeaders['Authorization'] = `Bearer ${token}`;
      }

      safeHeaders['Content-Type'] = 'application/json';
      safeHeaders['x-apollo-operation-name'] = operation.operationName || 'unknown';
      safeHeaders['apollo-require-preflight'] = 'true';

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
