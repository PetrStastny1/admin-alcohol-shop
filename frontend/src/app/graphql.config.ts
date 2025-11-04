import { inject } from '@angular/core';
import {
  InMemoryCache,
  ApolloLink,
  ApolloClientOptions,
  DefaultOptions,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

const defaultOptions: DefaultOptions = {
  watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
  mutate: { errorPolicy: 'all' },
};

export function apolloOptions(): ApolloClientOptions {
  const httpLink = inject(HttpLink);

  const graphqlUri =
    environment.graphqlUri ||
    (environment.production
      ? 'https://admin-alcohol-shop-production.up.railway.app/graphql'
      : 'http://localhost:3000/graphql');

  console.log('🚀 Apollo client initializing...');
  console.log('✅ Environment:', environment);
  console.log('✅ GraphQL URI:', graphqlUri);

  const authLink = new ApolloLink((operation, forward) => {
    console.log('➡️ Apollo operation:', operation.operationName);

    const token = localStorage.getItem('auth_token');

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...(headers as Record<string, string>),
        'Content-Type': 'application/json',
        'x-apollo-operation-name': operation.operationName || 'unknown',
        'apollo-require-preflight': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    // ✅ Typově korektní varianta – vrátíme prázdný Observable, pokud forward chybí
    if (!forward) {
      console.error('❌ Apollo forward() je undefined — link chain se přerušil!');
      return new Observable(); // místo null
    }

    return forward(operation);
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
