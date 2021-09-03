import { Component, OnInit } from '@angular/core';
import {TableDataSource} from "../shared/components/table-builder/table-builder.datasource";
import {DefaultService, User} from "eisenstecken-openapi-angular-library";
import {Router} from "@angular/router";
import {LockService} from "../shared/lock.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  userDataSource: TableDataSource<User>;

  public buttons = [
    [
      "Neuer Benutzer",
      (): void => {
        this.router.navigateByUrl('/user/edit/new');
      }
    ]
  ];

  constructor(private api: DefaultService, private locker: LockService, private router: Router) { }

  ngOnInit(): void {
    this.userDataSource = new TableDataSource(
      this.api,
      ( api, filter, sortDirection, skip, limit) => {
        return api.readUsersUsersGet(skip, filter, limit);
      },
      (dataSourceClasses) => {
        const rows = [];
        dataSourceClasses.forEach((dataSource) => {
          rows.push(
            {
              values: {
                fullname: dataSource.fullname,
                email : dataSource.email,
                tel: dataSource.tel
              },
              route : () => {
                this.locker.getLockAndTryNavigate(
                  this.api.islockedUserUsersIslockedUserIdGet(dataSource.id),
                  this.api.lockUserUsersLockUserIdGet(dataSource.id),
                  this.api.unlockUserUsersUnlockUserIdGet(dataSource.id),
                  '/user/edit/' +dataSource.id.toString()
                );
              }
            });
        });
        return rows;
      },
      [
        {name: "fullname", headerName: "Name"},
        {name: "email", headerName: "Email"},
        {name: "tel", headerName: "Telefon"}
      ],
      (api) => {
        return api.readJobCountJobCountGet();
      }
    );
    this.userDataSource.loadData();
  }

}
