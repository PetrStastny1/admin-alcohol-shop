import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

export interface LoginResponse {
  access_token: string;
  id: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private apollo: Apollo, private tokenService: TokenService) {}

  login(username: string, password: string): Observable<LoginResponse | null> {
    return this.apollo
      .mutate<{ login: LoginResponse }>({
        mutation: gql`
          mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              access_token
              id
              username
            }
          }
        `,
        variables: { username, password },
      })
      .pipe(
        map((res) => {
          const data = res.data?.login ?? null;
          if (data?.access_token) {
            this.tokenService.setToken(data.access_token);
          }
          return data;
        })
      );
  }

  logout(): void {
    this.tokenService.removeToken();
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }
}
