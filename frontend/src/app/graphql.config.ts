import { inject } from '@angular/core';
import { InMemoryCache, ApolloLink, DefaultOptions, ApolloClientOptions } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

const defaultOptions: DefaultOptions = {
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
};

export function apolloOptions(): ApolloClientOptions {
  const httpLink = inject(HttpLink);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token'); // 👈 sjednoceno

    operation.setContext(({ headers = {} }) => {
      return {
        headers: {
          ...(headers as Record<string, string>),
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
    defaultOptions,
  };
}
