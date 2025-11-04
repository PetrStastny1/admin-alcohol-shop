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
  private currentUser: LoginResponse | null = null;

  constructor(private apollo: Apollo, private tokenService: TokenService) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<LoginResponse | null> {
    console.log('🚀 Spouštím login mutation přes Apollo...');

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
          console.log('🛰️ Apollo response:', res);

          const data = res.data?.login ?? null;
          if (data?.access_token) {
            this.tokenService.setToken(data.access_token);
            this.currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(data));
          }
          return data;
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

  getCurrentUser(): LoginResponse | null {
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
      this.currentUser = JSON.parse(stored) as LoginResponse;
    }
  }
}
