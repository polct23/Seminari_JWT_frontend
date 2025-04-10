import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log("Dentro del interceptador");

  const token = localStorage.getItem('access_token');
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Intentar renovar el token
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = localStorage.getItem('access_token');
              if (newToken) {
                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
              }
              return next(req);
            }),
            catchError(() => {
              // Si falla la renovación, cerrar sesión
              authService.logout();
              toastr.error(
                'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
                'Sesión Expirada',
                {
                  timeOut: 3000,
                  closeButton: true
                }
              );
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          // Si no hay refreshToken, cerrar sesión
          authService.logout();
          toastr.error(
            'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            'Sesión Expirada',
            {
              timeOut: 3000,
              closeButton: true
            }
          );
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
}