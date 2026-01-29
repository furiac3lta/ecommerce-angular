import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionStorageService } from './session-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionStorage: SessionStorageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenObj = this.sessionStorage.getItem('token');
    const tokenValue = tokenObj?.token ?? tokenObj;
    const token =
      typeof tokenValue === 'string' && tokenValue.startsWith('Bearer ')
        ? tokenValue.slice(7)
        : tokenValue;
    const isPublic =
      req.url.includes('/api/v1/orders') ||
      req.url.includes('/api/v1/security') ||
      req.url.includes('/api/v1/home') ||
      req.url.includes('/api/v1/variants') ||
      req.url.includes('/api/v1/size-guides');

    const authReq = token && !isPublic ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!isPublic && (error.status === 401 || error.status === 403 || this.authService.isTokenExpired())) {
          this.authService.clearToken();
          this.router.navigate(['/']);
        }
        return throwError(error);
      })
    );
  }
}
