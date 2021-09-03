import { Component, OnInit } from '@angular/core';
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {DefaultService, Lock, Offer, User} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent extends BaseEditComponent<User> implements OnInit {
  userGroup: FormGroup;

  navigationTarget = "/user";
  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.unlockUserUsersUnlockUserIdGet(id);
  };

  dataFunction = (api: DefaultService, id: number): Observable<User> => {
    return api.readUserUsersUserIdGet(id);
  };

  unlockFunction = (afterUnlockFunction: VoidFunction = () => {
  }): void => {
    if (this.createMode) {
      afterUnlockFunction();
      return;
    }
    this.api.unlockUserUsersUnlockUserIdGet(this.id).subscribe(() => {
      afterUnlockFunction();
    });
  };

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    this.userGroup = new FormGroup({
      firstname: new FormControl(""),
      lastname: new FormControl(""),
      mail: new FormControl(""),
      tel: new FormControl(""),
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  onSubmit() :void  {

  }

  observableReady() :void {
    super.observableReady();
    console.log("hei");
    if(!this.createMode){
      this.data$.pipe(tap(user => this.userGroup.patchValue(user))).subscribe((user) => {
        console.log("done");
        console.log(user);
      });
    }
  }

  createUpdateSuccess(offer: Offer): void {
    this.id = offer.id;
    this.unlockFunction(() => {
      this.router.navigateByUrl("user");
    });
  }
}
