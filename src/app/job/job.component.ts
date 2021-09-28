import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Job} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';

@Component({
    selector: 'app-job',
    templateUrl: './job.component.html',
    styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
    jobDataSource: TableDataSource<Job>;

    constructor(private api: DefaultService, private router: Router) {
    }

    ngOnInit(): void {
        this.jobDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readMainjobsJobMainGet(skip, limit, filter)
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
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'status.text.translation_de': dataSource.status.text.translation_de
                            },
                            route: () => {
                                this.router.navigateByUrl('/job/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'client.name', headerName: 'Kunde'},
                {name: 'description', headerName: 'Beschreibung'},
                {name: 'status.text.translation_de', headerName: 'Status'}
            ],
            (api) => api.readJobCountJobCountMainGet()
        );
        this.jobDataSource.loadData();
    }

}
