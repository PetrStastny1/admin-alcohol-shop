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

  const infoMsg = `🚀 Apollo init → ENV: ${environment.production ? 'production' : 'dev'} | URI: ${graphqlUri}`;
  console.log(infoMsg);
  const banner = document.createElement('div');
  banner.textContent = infoMsg;
  banner.style.cssText =
    'position:fixed;bottom:0;left:0;width:100%;background:#1e293b;color:#fff;padding:4px 8px;font-size:10px;text-align:center;z-index:9999;';
  document.body.appendChild(banner);

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('auth_token');
    console.log('➡️ Apollo operation:', operation.operationName);

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...(headers as Record<string, string>),
        'Content-Type': 'application/json',
        'x-apollo-operation-name': operation.operationName || 'unknown',
        'apollo-require-preflight': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));

    if (!forward) {
      console.error('❌ Apollo forward() je undefined — link chain se přerušil!');
      return new Observable();
    }

    return forward(operation);
  });

  return {
    link: authLink.concat(httpLink.create({ uri: graphqlUri })),
    cache: new InMemoryCache(),
    defaultOptions,
  };
}
