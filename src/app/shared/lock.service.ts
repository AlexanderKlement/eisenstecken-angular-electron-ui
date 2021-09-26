import {Injectable} from '@angular/core';
import {DefaultService, Lock} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {LockDialogComponent} from './components/info-builder/lock-dialog/lock-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
    providedIn: 'root'
})
export class LockService {

    constructor(private api: DefaultService, private router: Router, public dialog: MatDialog) {
    }

    getLockAndTryNavigate(lock$: Observable<Lock>, lockObservable: Observable<boolean>, unlockObservable: Observable<boolean>, navigationTarget: string): void {
        lock$.pipe(first()).subscribe((lock) => {
            if (lock.locked) {
                this.api.readUsersMeUsersMeGet().pipe(first()).subscribe((user) => {
                    if (user.id === lock.user.id) {
                        this.lockAndNavigate(lockObservable, navigationTarget);
                    } else {
                        this.showLockDialog(lock, unlockObservable);
                    }
                });
            } else {
                this.lockAndNavigate(lockObservable, navigationTarget);
            }
        });
    }

    private lockAndNavigate(lockFunction: Observable<boolean>, navigationTarget: string): void {
        lockFunction.pipe(first()).subscribe((success) => {
            if (success) {
                this.router.navigateByUrl(navigationTarget);
            } else {
                console.error('LockService: Unable to lock desired resource');
            }
        });

    }

    private showLockDialog(lock: Lock, unlockObservable: Observable<boolean>): void {
        this.dialog.open(LockDialogComponent, {
            data: {
                lock,
                unlockFunction: unlockObservable
            }
        });
    }


}
