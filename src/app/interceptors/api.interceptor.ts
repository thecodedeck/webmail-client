import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private messageService: MessageService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error);

        return throwError(error);
      })
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // We display the error message using PrimeNG MessageService
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.error.message || error.message || 'An error occurred',
    });
  }
}
