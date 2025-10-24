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
  role: string;
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
              role
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
            localStorage.setItem('user_role', data.role);
          }
          return data;
        })
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    localStorage.removeItem('user_role');
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
}
