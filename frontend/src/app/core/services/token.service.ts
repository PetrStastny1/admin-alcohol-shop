import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly KEY = 'token';

  getToken(): string | null {
    return localStorage.getItem(this.KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.KEY);
  }

  isLoggedIn(): boolean {
    const t = this.getToken();
    return !!t;
  }
}
