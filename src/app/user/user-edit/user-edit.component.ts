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

const titles = {
  users: 'Benutzer',
  calendars: 'Kalender',
  vats: 'Mehrwertssteuer Einstellungen',
  units: 'Einheiten',
  suppliers: 'Lieferanten',
  stocks: 'Lager',
  rights: 'Rechte Verwaltung',
  orders: 'Bestellungen',
  offers: 'Angebote',
  jobs: 'Aufträge',
  parameters: 'Parameter Einstellungen',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ingoing_invoices: 'Eingangsrechnungen',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  outgoing_invoices: 'Ausgangsrechnungen',
  clients: 'Kundenverwaltung',
  categories: 'Produkt-Kategorien',
  articles: 'Produkte',
  reminders: 'Mahnwesen',
  payments: 'Zahlungen'
};

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
  availableRightCats: { key: string; open: boolean; title: string }[];
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
      if (cat.key === category) {
        return {key: cat.key, open: !cat.open, title: cat.title};
      } else {
        return cat;
      }
    });
  }

  onCategoryCheck(category: string, checkstate: 'unchecked' | 'checked' | 'indeterminate'): void {
    switch (checkstate) {
      case 'checked':
        this.userRights = this.userRights.filter((userRight) => !userRight.key.startsWith(category));
        break;
      case 'indeterminate':
      case 'unchecked':
        this.availableRights.forEach((right) => {
          if (right.key.startsWith(category) && this.userRights.filter((userRight) => userRight.id === right.id).length === 0) {
            this.userRights.push(right);
          }
        });
        break;
      default:
        break;
    }
  }

  onRightCheck(right: Right): void {
    if (this.userRights.filter(userRight => userRight.id === right.id).length === 0) {
      this.userRights.push(right);
    } else {
      this.userRights = this.userRights.filter((userRight) => userRight.id !== right.id);
    }
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
            let title = titles[rightKeyCat];
            if (typeof title === 'undefined') {
              title = 'Neue Kategorie';
            }
            this.availableRightCats.push({key: rightKeyCat, open: false, title});
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

  userHasRightCategory(rightCategory: string): 'unchecked' | 'checked' | 'indeterminate' {
    let hasAll = true;
    let hasOne = false;
    for (const right of this.availableRights) {
      if (right.key.startsWith(rightCategory)) {
        if (this.userHasRight(right.key)) {
          hasOne = true;
        }
        if (!this.userHasRight(right.key)) {
          hasAll = false;
        }
      }
    }
    return hasAll ? 'checked' : hasOne ? 'indeterminate' : 'unchecked';
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
      this.userRights = user.rights;
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
