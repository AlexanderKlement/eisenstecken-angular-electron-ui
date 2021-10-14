import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, User} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';
import {LockService} from '../shared/lock.service';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {AuthService} from '../shared/auth.service';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

    userDataSource: TableDataSource<User>;
    public buttons: CustomButton[] = [];


    constructor(private api: DefaultService, private locker: LockService, private router: Router, private authService: AuthService) {
    }

    ngOnInit(): void {
        this.userDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readUsersUsersGet(skip, filter, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                fullname: dataSource.fullname,
                            },
                            route: () => {
                                this.authService.currentUserHasRight('users:create').pipe(first()).subscribe(allowed => {
                                    if (allowed) {
                                        this.locker.getLockAndTryNavigate(
                                            this.api.islockedUserUsersIslockedUserIdGet(dataSource.id),
                                            this.api.lockUserUsersLockUserIdGet(dataSource.id),
                                            this.api.unlockUserUsersUnlockUserIdGet(dataSource.id),
                                            '/user/edit/' + dataSource.id.toString()
                                        );
                                    }
                                });
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'fullname', headerName: 'Name'},
            ],
            (api) => api.readUserCountUsersCountGet(),
        );
        this.userDataSource.loadData();
        this.authService.currentUserHasRight('users:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Neuer Benutzer',
                    navigate: (): void => {
                        this.router.navigateByUrl('/user/edit/new');
                    }
                });
            }
        });
    }

}
