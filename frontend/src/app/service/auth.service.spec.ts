import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService, TOKEN_KEY, USERNAME_KEY } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('stores the token and the username after a successful login', () => {
    let receivedToken = '';
    service.login('demo', 'demo1234').subscribe((response) => (receivedToken = response.token));

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'demo', password: 'demo1234' });

    request.flush({ token: 'jwt-token', username: 'demo', expiresAt: '2030-01-01T00:00:00Z' });

    expect(receivedToken).toBe('jwt-token');
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    expect(sessionStorage.getItem(USERNAME_KEY)).toBe('demo');
  });

  it('clears the session on logout', () => {
    sessionStorage.setItem(TOKEN_KEY, 'jwt-token');
    sessionStorage.setItem(USERNAME_KEY, 'demo');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUsername()).toBeNull();
  });

  it('detects an expired token', () => {
    const expired = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    expect(service.isExpired(`header.${expired}.signature`)).toBeTrue();
  });
});
