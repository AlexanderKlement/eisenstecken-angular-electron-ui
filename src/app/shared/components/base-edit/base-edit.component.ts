import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, ReplaySubject, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {DefaultService, Lock, User} from 'eisenstecken-openapi-angular-library';
import {DataSourceClass} from '../../types';
import {MatDialog} from '@angular/material/dialog';
import {WarningDialogComponent} from './warning-dialog/warning-dialog.component';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-base-edit',
    template: ``,
    styleUrls: ['./base-edit.component.scss']
})
export class BaseEditComponent<T extends DataSourceClass> implements OnInit, OnDestroy {

    //This has to be defined by Derived class:
    navigationTarget: string;
    lockFunction: (api: DefaultService, id: number) => Observable<Lock>;
    unlockFunction: (api: DefaultService, id: number) => Observable<boolean>;
    dataFunction: (api: DefaultService, id: number) => Observable<T>;

    //this not:
    me$: Observable<User>;
    data$: Observable<T>;
    createMode = false;
    id: number;
    submitted = false;
    routeParams: ReplaySubject<Params> = new ReplaySubject<Params>(1);
    subscription: Subscription;
    timeouts: NodeJS.Timeout[];

    constructor(protected api: DefaultService, protected router: Router, protected route: ActivatedRoute, public dialog: MatDialog) {
        this.subscription = new Subscription();
        this.subscription.add(this.route.params.subscribe((params) => this.routeParams.next(params)));
        this.timeouts = [];
    }

    private static minutesToMilliSeconds(minutes: number): number {
        return minutes * 60 * 1000;
    }

    ngOnInit(): void {
        this.me$ = this.api.readUsersMeUsersMeGet();
        this.routeParams.pipe(first()).subscribe((params) => {
            if (params.id === 'new') {
                this.createMode = true;
                return;
            }
            this.id = parseInt(params.id, 10);
            if (isNaN(this.id)) {
                console.error('BaseEditComponent: Cannot parse given id');
                this.goBack();
            }
            console.log('Loading given datasource with id: ' + this.id.toString());
            if (!this.createMode) {
                this.lockFunction(this.api, this.id).pipe(first()).subscribe(lock => {
                    if (!lock.locked) {//has to be locked, otherwise component is accessed directly {
                        console.error('BaseEditComponent: The lock is not locked. This should not happen on accessing a ressource');
                        this.goBack();
                    }
                    this.me$.pipe(first()).subscribe((user) => {
                        if (user.id !== lock.user.id) {//if locked by other user go back
                            console.error('BaseEditComponent: The accessed ressource is locked by another user');
                            this.goBack();
                        } else {   //now we talking
                            this.data$ = this.dataFunction(this.api, this.id);
                            this.observableReady();
                            this.timeouts.push(setTimeout(() => {
                                this.showWarningDialog(lock.max_lock_time_minutes, lock.reminder_time_minutes);
                            }, BaseEditComponent.minutesToMilliSeconds(lock.max_lock_time_minutes - lock.reminder_time_minutes)));
                            this.timeouts.push(setTimeout(() => {
                                console.warn('BaseEditComponent: Going back, because maximum access time is over');
                                this.goBack();
                            }, BaseEditComponent.minutesToMilliSeconds(lock.max_lock_time_minutes)));
                        }
                    });
                });
            }
        });
        this.startListeningForUnload();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.timeouts.forEach((timeout) => {
            clearTimeout(timeout);
        });
        if (!this.createMode) {
            this.unlockFunction(this.api, this.id).pipe(first()).subscribe((success) => {
                if (success) {
                    console.log('BaseEdit: SUCCESS: unlocked object with id: ' + this.id);
                } else {
                    console.warn('BaseEdit: FAIL: to unlock object with id: ' + this.id);
                }
            });
        }
        this.stopListeningForUnload();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    createUpdateError(error: any): void {
        this.submitted = false;
        console.log(error); //TODO: make error handling here
    }

    createUpdateComplete(): void {
        this.submitted = false;
    }

    protected goBack(): void {
        console.log('BaseEditComponent: Go Back is called');
        this.router.navigateByUrl(this.navigationTarget);
    }

    protected observableReady(): void {
        // eslint-disable-next-line no-console
        console.info('BaseEditComponent: The data observable is ready');
    }

    private startListeningForUnload(): void {
        window.addEventListener('beforeunload', this.ngOnDestroy.bind(this));
    }

    private stopListeningForUnload(): void {
        window.removeEventListener('beforeunload', this.ngOnDestroy.bind(this));
    }

    private showWarningDialog(totBlockTime: number, remBlockTime: number): void {
        this.dialog.open(WarningDialogComponent, {
            data: {
                totalBlockingTime: totBlockTime,
                remainingBlockingTime: remBlockTime
            }
        });
    }
}

