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

  // ✅ Korektní GraphQL endpoint
  const graphqlUri = environment.graphqlUri.startsWith('http')
    ? environment.graphqlUri
    : `${environment.apiUrl}${environment.graphqlUri}`;

  console.log('🚀 Apollo client initializing...');
  console.log('✅ GraphQL URI:', graphqlUri);

  // ✅ Autorizace + hlavičky
  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token') || '';

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      fetchOptions: {
        method: 'POST', // ✅ Vynucený POST
      },
    }));

    return forward(operation);
  });

  // ✅ HTTP transport
  const http = httpLink.create({
    uri: graphqlUri,
    includeExtensions: false,
    withCredentials: false,
  });

  // ✅ Finální klient
  return {
    link: ApolloLink.from([authLink, http]),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
