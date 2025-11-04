import { inject } from '@angular/core';
import {
  InMemoryCache,
  ApolloLink,
  DefaultOptions,
  ApolloClientOptions,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const defaultOptions: DefaultOptions = {
  watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  mutate: { errorPolicy: 'all' },
};

export function apolloOptions(): ApolloClientOptions {
  const httpLink = inject(HttpLink);

  // ✅ Použij relativní endpoint v produkci (funguje i na mobilu / Railway)
  const graphqlUri = environment.production
    ? '/graphql'
    : 'http://localhost:3000/graphql';

  if (!environment.production) {
    console.log('🚀 Apollo client initializing...');
    console.log('✅ GraphQL URI:', graphqlUri);
  }

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...(headers as Record<string, string>),
        'Content-Type': 'application/json',
        'x-apollo-operation-name': operation.operationName || 'unknown',
        'apollo-require-preflight': 'true', // Safari / CSRF fix
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    return forward ? forward(operation) : new Observable();
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache({
      typePolicies: {
        Customer: {
          fields: {
            orders: {
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions,
  };
}
