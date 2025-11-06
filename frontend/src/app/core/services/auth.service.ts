import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { HttpHeaders } from '@angular/common/http';

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User | null = null;

  constructor(private apollo: Apollo, private tokenService: TokenService) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<User | null> {
    return this.apollo
      .mutate<{ loginAdmin: LoginResponse }>({
        mutation: gql`
          mutation Login($input: LoginAdminInput!) {
            loginAdmin(input: $input) {
              access_token
              user {
                id
                username
                role
              }
            }
          }
        `,
        variables: {
          input: { username, password },
        },
        context: {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'x-apollo-operation-name': 'Login',
            'apollo-require-preflight': 'true',
          }),
        },
      })
      .pipe(
        map((res) => {
          const loginData = res.data?.loginAdmin ?? null;
          if (loginData?.access_token && loginData.user) {
            this.tokenService.setToken(loginData.access_token);
            this.currentUser = loginData.user;

            localStorage.setItem(
              'currentUser',
              JSON.stringify({
                ...loginData.user,
                access_token: loginData.access_token,
              })
            );

            return loginData.user;
          }
          return null;
        })
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserRole(): string | null {
    return this.currentUser?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored) as User;
    }
  }
}
