import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../app.constants';

export const TOKEN_KEY = 'taskflow_token';
export const USERNAME_KEY = 'taskflow_username';

export interface TokenResponse {
  token: string;
  username: string;
  expiresAt: string;
}

export interface UserResponse {
  username: string;
}

/**
 * Owns the authentication state: calls the REST API, stores the JWT and
 * exposes helpers used by the interceptor, the route guard and the components.
 *
 * The token is kept in sessionStorage, so it disappears when the browser tab
 * is closed and is never written to disk.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${API_URL}/auth/login`, { username, password })
      .pipe(
        tap((response) => {
          sessionStorage.setItem(TOKEN_KEY, response.token);
          sessionStorage.setItem(USERNAME_KEY, response.username);
        })
      );
  }

  register(username: string, password: string): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${API_URL}/auth/register`, { username, password });
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return sessionStorage.getItem(USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isExpired(token);
  }

  /**
   * Reads the "exp" claim of the JWT to know whether it is still valid.
   * The token is signed, so the client can trust the payload for display
   * purposes - the server always re-checks the signature and the expiry.
   */
  isExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized));
      const expiresAt = decoded.exp * 1000;
      return Date.now() >= expiresAt;
    } catch (error) {
      return true;
    }
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
  }
}
