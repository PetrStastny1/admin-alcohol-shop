import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

interface LoginAdminResponse {
  loginAdmin: {
    access_token: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private apollo: Apollo, private tokenService: TokenService) {}

  login(username: string, password: string): Observable<string | null> {
    return this.apollo
      .mutate<LoginAdminResponse>({
        mutation: gql`
          mutation LoginAdmin($username: String!, $password: String!) {
            loginAdmin(username: $username, password: $password) {
              access_token
            }
          }
        `,
        variables: { username, password },
      })
      .pipe(
        map((res) => {
          const token = res.data?.loginAdmin?.access_token ?? null;
          if (token) {
            this.tokenService.setToken(token);
          }
          return token;
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
