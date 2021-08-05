import { Component, OnInit } from '@angular/core';
import {Observable, ReplaySubject, Subject, Subscription} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {DefaultService, Lock, User} from "eisenstecken-openapi-angular-library";
import {DataSourceClass} from "../../types";
import {MatDialog} from "@angular/material/dialog";
import {WarningDialogComponent} from "./warning-dialog/warning-dialog.component";
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-base-edit',
  template: ``,
  styleUrls: ['./base-edit.component.scss']
})
export class BaseEditComponent <T extends DataSourceClass> implements OnInit {

  //This has to be defined by Derived class:
  navigationTarget: string;
  lockFunction: (api: DefaultService, id: number) => Observable<Lock>;
  dataFunction: (api: DefaultService, id: number) => Observable<T>;

  //this not:
  me: Observable<User>;
  data$: Observable<T>;
  createMode = false;
  id: number;
  submitted = false;
  routeParams: ReplaySubject<Params> = new ReplaySubject<Params>(1);
  subscription: Subscription;

  constructor(protected api: DefaultService, protected router: Router, protected route: ActivatedRoute, public dialog: MatDialog) {
    this.subscription = new Subscription();
    this.subscription.add(this.route.params.subscribe((params) => this.routeParams.next(params)));
  }

  ngOnInit(): void {
    this.me = this.api.readUsersMeUsersMeGet();
    this.routeParams.pipe(first()).subscribe((params) => {
      if(params.id == "new"){
        this.createMode = true;
        return;
      }
      this.id = parseInt(params.id);
      if(isNaN(this.id)){
        console.error("BaseEditComponent: Cannot parse given id");
        this.goBack();
      }

      this.lockFunction(this.api, this.id).pipe(first()).subscribe(lock => {
        if (!lock.locked) //has to be locked, otherwise component is accessed directly
          this.goBack();
        this.me.pipe(first()).subscribe((user) => {
          if (user.id != lock.user.id) //if locked by other user go back
            this.goBack();
          else{   //now we talking
            this.data$ = this.dataFunction(this.api, this.id);
            this.observableReady();
            setTimeout(() => {
              this.showWarningDialog(lock.max_lock_time_minutes, lock.reminder_time_minutes);
            }, BaseEditComponent.minutesToMilliSeconds(lock.max_lock_time_minutes - lock.reminder_time_minutes));
            setTimeout( () => {
              this.goBack();
            }, BaseEditComponent.minutesToMilliSeconds(lock.max_lock_time_minutes));
          }
        });
      });
    });
  }

  ngOnDestroy() :void {
    this.subscription.unsubscribe();
  }

  private static minutesToMilliSeconds(minutes: number): number {
    return minutes * 60 * 1000;
  }

  private showWarningDialog(totBlockTime: number, remBlockTime: number): void {
    this.dialog.open(WarningDialogComponent, {
      data: {
        totalBlockingTime: totBlockTime,
        remainingBlockingTime: remBlockTime
      }
    });
  }

  protected goBack() : void {
    this.router.navigateByUrl(this.navigationTarget);
  }

  protected observableReady():void {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  createUpdateError(error: any): void {
    console.log(error); //TODO: make error handling here
  }

  createUpdateComplete() : void {
    this.submitted = false;
  }


}
