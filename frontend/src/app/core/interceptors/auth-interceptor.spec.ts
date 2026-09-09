import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add the Authorization header when a token exists', () => {
    localStorage.setItem('token', 'test-token');

    const request = new HttpRequest('GET', '/api/test');

    const next: HttpHandlerFn = (req) => {
      expect(req.headers.get('Authorization')).toBe('Bearer test-token');

      return of(null as unknown as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe();
    });
  });

  it('should not add the Authorization header when there is no token', () => {
    const request = new HttpRequest('GET', '/api/test');

    const next: HttpHandlerFn = (req) => {
      expect(req.headers.has('Authorization')).toBe(false);

      return of(null as unknown as HttpEvent<unknown>);
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe();
    });
  });
});