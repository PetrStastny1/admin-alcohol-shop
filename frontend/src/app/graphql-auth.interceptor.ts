import { Injectable } from '@angular/core';
import { ApolloLink } from '@apollo/client/core';

@Injectable()
export class AuthApolloLink extends ApolloLink {
  constructor() {
    super((operation, forward) => {
      const token = localStorage.getItem('auth_token');

      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }));

      return forward(operation);
    });
  }
}
