import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { TOKEN_KEY } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('adds the Bearer token to the outgoing requests', () => {
    sessionStorage.setItem(TOKEN_KEY, 'jwt-token');

    http.get('/api/todos').subscribe();

    const request = httpMock.expectOne('/api/todos');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('sends no Authorization header when there is no session', () => {
    http.get('/api/todos').subscribe();

    const request = httpMock.expectOne('/api/todos');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush([]);
  });
});
