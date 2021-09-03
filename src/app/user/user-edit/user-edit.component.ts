import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {DefaultService, Lock, Right, User, UserCreate, UserUpdate} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {first, map, tap} from "rxjs/operators";
import {MatSelectionList} from "@angular/material/list";

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent extends BaseEditComponent<User> implements OnInit {
  userGroup: FormGroup;
  availableRights : Right[];
  userRights : Right[];
  rightsLoaded = false;

  @ViewChild('rights') rightsSelected: MatSelectionList;

  navigationTarget = "user";
  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedUserUsersIslockedUserIdGet(id);
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
    super.ngOnInit();
    this.api.getRightsRightsGet().pipe(first()).subscribe((rights) => {
      this.availableRights = rights;
      this.api.readUserUsersUserIdGet(this.id).pipe(first()).subscribe((user) => {
        this.userRights = user.rights;
        this.rightsLoaded = true;
      });
    });
    this.userGroup = new FormGroup({
      firstname: new FormControl(""),
      secondname: new FormControl(""),
      email: new FormControl(""),
      tel: new FormControl(""),
    });
  }

  userHasRight(rightKey: string): boolean {
    for(let i=0; i<this.userRights.length; i++){
      if(this.userRights[i].key == rightKey){
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }


  observableReady() :void {
    super.observableReady();
    if(!this.createMode){
      this.data$.pipe(tap(user => this.userGroup.patchValue(user)), first()).subscribe();
    }
  }

  createUpdateSuccess(user: User): void {
    this.id = user.id;
    this.unlockFunction(() => {
      this.router.navigateByUrl("user");
    });
  }

  onSubmit(): void {
    this.submitted = true;
  }

  onSubmitGeneral() :void {
    this.onSubmit();
    if(this.createMode) {
      const userCreate: UserCreate = {
        email: this.userGroup.get("email").value,
        tel: this.userGroup.get("tel").value,
        firstname: this.userGroup.get("firstname").value,
        secondname: this.userGroup.get("secondname").value,
        password: this.userGroup.get("password").value
      };
      this.api.createUserUsersPost(userCreate).pipe(first()).subscribe((user) => {
        this.createUpdateSuccess(user);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    } else {
      const userUpdate: UserUpdate = {
        email: this.userGroup.get("email").value,
        tel: this.userGroup.get("tel").value,
        firstname: this.userGroup.get("firstname").value,
        secondname: this.userGroup.get("secondname").value,
      };
      this.api.updateUserUsersUserIdPut(this.id, userUpdate).pipe(first()).subscribe((user) => {
        this.createUpdateSuccess(user);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    }
  }

  onSubmitRights(): void {
    const selectedKeys = this.rightsSelected.selectedOptions.selected.map((obj) => obj.value);
    this.api.grantRightsToUserUsersRightsUserIdPost(this.id, selectedKeys).pipe(first()).subscribe((user) => {
      this.createUpdateSuccess(user);
    }, (error) => {
      this.createUpdateError(error);
    }, () => {
      this.createUpdateComplete();
    });
  }

  onSubmitPassword(): void {

  }
}
