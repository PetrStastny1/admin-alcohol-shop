import { HttpHeaders } from '@angular/common/http';
import { InMemoryCache, ApolloLink, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

const authLink = setContext((_, context) => {
  const token = localStorage.getItem('token');

  let headers = context.headers as HttpHeaders | undefined;
  if (!headers) {
    headers = new HttpHeaders();
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return {
    ...context,
    headers,
  };
});

export const apolloClientConfig = {
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
};
