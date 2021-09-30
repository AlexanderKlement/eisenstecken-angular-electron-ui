import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Job} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';

@Component({
    selector: 'app-recalculation',
    templateUrl: './recalculation.component.html',
    styleUrls: ['./recalculation.component.scss']
})
export class RecalculationComponent implements OnInit {

    jobDataSource: TableDataSource<Job>;


    constructor(private api: DefaultService, private router: Router) {
    }

    ngOnInit(): void {
        this.initJobDataSource();
    }

    initJobDataSource(): void {
        this.jobDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readMainjobsJobMainGet(skip, limit, filter, 'JOBSTATUS_COMPLETED')
            ,
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                'client.name': dataSource.client.fullname,
                                description: dataSource.description,
                            },
                            route: () => {
                                this.router.navigateByUrl('/recalculation/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'client.name', headerName: 'Kunde'},
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readJobCountJobCountMainGet() // TODO add status here on next update
        );
        this.jobDataSource.loadData();
    }

}
