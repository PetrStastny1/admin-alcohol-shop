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
  console.log('✅ GraphQL URI:', graphqlUri);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    operation.setContext((ctx: Record<string, any> = {}) => {
      const newHeaders: Record<string, string> = {};
      const existingHeaders = ctx['headers'];

      if (existingHeaders instanceof Headers) {
        existingHeaders.forEach((v, k) => (newHeaders[k] = v));
      } else if (
        existingHeaders &&
        typeof existingHeaders === 'object' &&
        !(existingHeaders instanceof Headers)
      ) {
        Object.assign(newHeaders, existingHeaders as Record<string, string>);
      }

      newHeaders['Content-Type'] = 'application/json';
      newHeaders['x-apollo-operation-name'] = operation.operationName || 'unknown';
      newHeaders['apollo-require-preflight'] = 'true';
      if (token) newHeaders['Authorization'] = `Bearer ${token}`;

      return { ...ctx, headers: newHeaders };
    });

    return forward(operation);
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
