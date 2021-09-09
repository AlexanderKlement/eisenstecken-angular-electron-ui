import { Component, OnInit } from '@angular/core';
import {TableDataSource} from "../shared/components/table-builder/table-builder.datasource";
import {DefaultService, Job} from "eisenstecken-openapi-angular-library";
import {Router} from "@angular/router";

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  jobDataSource: TableDataSource<Job>;

  constructor(private api: DefaultService, private router: Router) { }

  ngOnInit(): void {
    this.jobDataSource = new TableDataSource(
      this.api,
      ( api, filter, sortDirection, skip, limit) => {
        return api.readJobsByClientJobClientClientIdGet(0, filter, skip, limit); //TODO: remove this 0, to get all clients
      },
      (dataSourceClasses) => {
        const rows = [];
        dataSourceClasses.forEach((dataSource) => {
          rows.push(
            {
              values: {
                id: dataSource.id,
                "orderable.name" : dataSource.orderable.name,
                description: dataSource.description
              },
              route : () => {
                this.router.navigateByUrl('/job/' +dataSource.id.toString());
              }
            });
        });
        return rows;
      },
      [
        {name: "id", headerName: "ID"},
        {name: "orderable.name", headerName: "Name"},
        {name: "description", headerName: "Beschreibung"}
      ],
      (api) => {
        return api.readJobCountJobCountGet();
      }
    );
    this.jobDataSource.loadData();
  }

}
