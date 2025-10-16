import { APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpHeaders } from '@angular/common/http';

export const APOLLO_PROVIDER = {
  provide: APOLLO_OPTIONS,
  useFactory: () => {
    const httpLink = createHttpLink({
      uri: 'http://localhost:3000/graphql',
    });

    const authLink = setContext((_, prevContext) => {
      const token = localStorage.getItem('token');

      // použijeme HttpHeaders místo obyčejného objektu
      let headers = prevContext.headers as HttpHeaders | undefined;
      if (!headers) {
        headers = new HttpHeaders();
      }

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      return {
        ...prevContext,
        headers,
      };
    });

    return {
      link: ApolloLink.from([authLink, httpLink]),
      cache: new InMemoryCache(),
    };
  },
};
