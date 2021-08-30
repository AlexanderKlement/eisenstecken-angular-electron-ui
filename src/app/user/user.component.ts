import { Component, OnInit } from '@angular/core';
import {TableDataSource} from "../shared/components/table-builder/table-builder.datasource";
import {DefaultService, User} from "eisenstecken-openapi-angular-library";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  userDataSource: TableDataSource<User>;

  constructor(private api: DefaultService, private router: Router) { }

  ngOnInit(): void {
    this.userDataSource = new TableDataSource(
      this.api,
      ( api, filter, sortDirection, skip, limit) => {
        return api.readUsersUsersGet();
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
                this.router.navigateByUrl('/job/' +dataSource.id.toString());
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
