import {Injectable} from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError,} from 'rxjs/operators';
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
                    this.snackBar.open(error.error.body, 'Ok', {
                        duration: 10000
                    });
                }
                return throwError(error.message);
            })
        );
    }
}
