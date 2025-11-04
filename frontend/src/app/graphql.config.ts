import { inject } from '@angular/core';
import {
  InMemoryCache,
  ApolloLink,
  DefaultOptions,
  ApolloClientOptions,
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

  const graphqlUri =
    environment.graphqlUri ||
    (environment.production
      ? 'https://admin-alcohol-shop-production.up.railway.app/graphql'
      : 'http://localhost:3000/graphql');

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...(headers as Record<string, string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));
    return forward(operation);
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
