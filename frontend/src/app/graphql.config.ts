import { inject } from '@angular/core';
import { InMemoryCache, ApolloLink, DefaultOptions } from '@apollo/client/core';
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

export const apolloOptions = () => {
  const httpLink = inject(HttpLink);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('token');
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));
    return forward(operation);
  });

  return {
    link: authLink.concat(
      httpLink.create({ uri: 'http://localhost:3000/graphql' })
    ),
    cache: new InMemoryCache(),
    defaultOptions,
  };
};
