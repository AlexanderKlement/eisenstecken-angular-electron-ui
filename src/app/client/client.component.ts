import { Component, OnInit } from '@angular/core';
import {TableDataSource} from "../shared/components/table-builder/table-builder.datasource";
import {DefaultService, Client} from "eisenstecken-openapi-angular-library";
import {Router} from "@angular/router";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})

export class ClientComponent implements OnInit {

  public clientDataSource: TableDataSource<Client>;

  constructor(private api: DefaultService, private router: Router) {}

  ngOnInit(): void {
    this.clientDataSource = new TableDataSource(
      this.api,
      ( api, filter, sortDirection, skip, limit) => {
        return api.readClientsClientGet(skip, limit, filter);
      },
      (dataSourceClasses) => {
        const rows = [];
        dataSourceClasses.forEach((dataSource) => {
          rows.push(
            {
              values: {
                id: dataSource.id,
                name: dataSource.name,
                lastname: dataSource.lastname
              },
              route : () => {
                this.router.navigateByUrl('/client/' +dataSource.id.toString());
              }
            });
        });
        return rows;
      },
      [
        {name: "id", headerName: "ID"},
        {name: "name", headerName: "Name"},
        {name: "lastname", headerName: "Nachname"}
      ],
      (api) => {
        return api.readClientCountClientCountGet();
      }
    );
    this.clientDataSource.loadData();
  }

}
