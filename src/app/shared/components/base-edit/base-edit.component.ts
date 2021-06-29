import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {DefaultService, Lock, User} from "eisenstecken-openapi-angular-library";
import {DataSourceClass} from "../../types";
import {MatDialog} from "@angular/material/dialog";
import {WarningDialogComponent} from "./warning-dialog/warning-dialog.component";

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
  data$: BehaviorSubject<T>;
  create = false;


  constructor(protected api: DefaultService, protected router: Router, protected route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.me = this.api.readUsersMeUsersMeGet();
    this.route.params.subscribe((params) => {
      let id;
      try {
        id = parseInt(params.id);
      } catch {
        console.error("Cannot parse given id");
        this.goBack();
        return;
      }
      if(id == 0){
        this.create = true;
        return;
      }
      this.lockFunction(this.api, id).subscribe(lock => {
        if (!lock.locked)
          this.goBack();
        this.me.subscribe((user) => {
          if (user.id != lock.user.id)
            this.goBack();
          else{
            this.dataFunction(this.api, id).subscribe(this.data$);
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

}
