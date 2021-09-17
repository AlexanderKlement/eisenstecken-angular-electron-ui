import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {
  DefaultService,
  Lock,
  Right,
  User,
  UserCreate,
  UserPassword,
  UserUpdate
} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {MatSelectionList} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent extends BaseEditComponent<User> implements OnInit, OnDestroy {

  @ViewChild('rights') rightsSelected: MatSelectionList;

  userGroup: FormGroup;
  passwordGroup: FormGroup;
  availableRights: Right[];
  availableRightCats: { key: string; open: boolean }[];
  userRights: Right[];
  rightsLoaded = false;


  navigationTarget = 'user';

  constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog, private snackBar: MatSnackBar) {
    super(api, router, route, dialog);
  }


  lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedUserUsersIslockedUserIdGet(id);

  dataFunction = (api: DefaultService, id: number): Observable<User> => api.readUserUsersUserIdGet(id);

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

  onCategoryClick(category: string): void {
    this.availableRightCats = this.availableRightCats.map((cat) => {
      if (cat.key === category)
        {return {key: cat.key, open: !cat.open};}
      else {return cat;}
    });
  }

  ngOnInit(): void {
    this.availableRightCats = [];
    super.ngOnInit();
    this.userGroup = new FormGroup({
      firstname: new FormControl(''),
      secondname: new FormControl(''),
      email: new FormControl(''),
      tel: new FormControl(''),
      password: new FormControl('')
    });
    this.passwordGroup = new FormGroup({
      password: new FormControl('')
    });
    if (!this.createMode) {
      this.api.getRightsRightsGet().pipe(first()).subscribe((rights) => {
        this.availableRights = rights;
        rights.forEach(right => {
          const rightKeyCat = right.key.split(':')[0];
          if (this.availableRightCats.filter(cat => cat.key === rightKeyCat).length === 0) {
            this.availableRightCats.push({key: rightKeyCat, open: false});
          }
        });
        this.api.readUserUsersUserIdGet(this.id).pipe(first()).subscribe((user) => {
          this.userRights = user.rights;
          this.rightsLoaded = true;
        });
      });
    }
  }

  userHasRight(rightKey: string): boolean {
    for (const userRight of this.userRights) {
      if (userRight.key === rightKey) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }


  observableReady(): void {
    super.observableReady();
    if (!this.createMode) {
      this.data$.pipe(tap(user => this.userGroup.patchValue(user)), first()).subscribe();
    }
  }

  createUpdateSuccess(user: User): void {
    this.id = user.id;
    this.navigationTarget = 'user/edit/' + user.id.toString();
    this.unlockFunction(() => {
      this.router.navigateByUrl(this.navigationTarget);
    });
    this.snackBar.open('Speichern erfolgreich!', 'Ok', {
      duration: 3000
    });
  }

  onSubmit(): void {
    this.submitted = true;
  }

  onSubmitGeneral(): void {
    this.onSubmit();
    if (this.createMode) {
      const userCreate: UserCreate = {
        email: this.userGroup.get('email').value,
        tel: this.userGroup.get('tel').value,
        firstname: this.userGroup.get('firstname').value,
        secondname: this.userGroup.get('secondname').value,
        password: this.userGroup.get('password').value
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
        email: this.userGroup.get('email').value,
        tel: this.userGroup.get('tel').value,
        firstname: this.userGroup.get('firstname').value,
        secondname: this.userGroup.get('secondname').value,
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
    const userPassword: UserPassword = {
      password: this.passwordGroup.get('password').value
    };
    this.api.updateUserPasswordUsersPasswordUserIdPut(this.id, userPassword).pipe(first()).subscribe((user) => {
      this.createUpdateSuccess(user);
    }, (error) => {
      this.createUpdateError(error);
    }, () => {
      this.createUpdateComplete();
    });
  }
}
