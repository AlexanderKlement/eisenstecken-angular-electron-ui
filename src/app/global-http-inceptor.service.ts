import {Injectable} from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {

    constructor(public router: Router, private snackBar: MatSnackBar) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            catchError((error) => {
                console.log('Intercepting error');
                console.error(error);
                if ('error' in error && 'body' in error.error) {
                    this.snackBar.open(error.error.body, 'Ok');
                }
                return throwError(error.message);
            })
        );
    }
}
