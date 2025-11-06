import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';


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

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<User | null> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        map((loginData) => {
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
      const parsed = JSON.parse(stored);
      this.currentUser = {
        id: parsed.id,
        username: parsed.username,
        role: parsed.role,
      };
    }
  }
}
