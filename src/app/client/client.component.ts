import { Component, OnInit } from '@angular/core';
import {GeneralDataSource} from "../shared/components/table-builder/table-builder.datasource";
import {DefaultService, Client} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})


export class ClientComponent implements OnInit {

  public clientDataSource: GeneralDataSource<Client>;

  constructor(private api: DefaultService) {}

  ngOnInit(): void {
    this.clientDataSource = new GeneralDataSource(
      this.api,
      ( api, filter, sortDirection, pageIndex, pageSize) => {
        console.log(filter);
        console.log(sortDirection);
        console.log(pageIndex);
        console.log(pageSize);
        return api.readClientsClientGet(); //TODO: modify this to enable filtering and sorting
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
              }
            });
        });
        console.log(rows);
        return rows;
      },
      [
        {name: "id", headerName: "ID"},
        {name: "name", headerName: "Name"},
        {name: "lastname", headerName: "Nachname"}
      ]
    );
    this.clientDataSource.loadData();
  }

}
