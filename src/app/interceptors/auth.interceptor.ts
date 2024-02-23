import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get the username and password from the AuthService
    const user = this.authService.user;
    const password = this.authService.password;

    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: 'Basic ' + btoa(user + ':' + password),
      },
    });

    // Pass the cloned request with headers to the next handler
    return next.handle(authReq);
  }
}
