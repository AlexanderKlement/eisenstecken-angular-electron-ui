import {Component, OnInit} from '@angular/core';
import {DefaultService, Workload} from 'eisenstecken-openapi-angular-library';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {WorkHourEditDialogComponent} from './work-hour-edit-dialog/work-hour-edit-dialog.component';

@Component({
    selector: 'app-work-hours',
    templateUrl: './work-hours.component.html',
    styleUrls: ['./work-hours.component.scss']
})
export class WorkHoursComponent implements OnInit {
    buttons: any;
    workloadDataSource: TableDataSource<Workload>;
    jobId: number;


    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router, public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.jobId = parseInt(params.job_id, 10);
            if (isNaN(this.jobId)) {
                console.error('RecalculationDetail: Cannot parse jobId');
                this.router.navigateByUrl('recalculation');
                return;
            }
            this.initWorkloadTable();
        });
    }

    workHourClicked(workHourId: number, userId: number): void {
        const dialogRef = this.dialog.open(WorkHourEditDialogComponent, {
            width: '600px',
            data: {
                userId,
                create: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.reload) {
                    window.location.reload();
                }
            }
        });
    }

    private initWorkloadTable(): void {
        this.workloadDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readWorkloadsWorkloadGet(skip, limit, filter, undefined, this.jobId),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                'user.fullname': dataSource.user.fullname,
                                minutes: dataSource.minutes, //TODO: parse to HR format
                                cost: dataSource.cost,
                            },
                            route: () => {
                                this.workHourClicked(dataSource.id, dataSource.user.id);
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'user.fullname', headerName: 'Name'},
                {name: 'minutes', headerName: 'Zeit'},
                {name: 'cost', headerName: 'Kosten [€]'},
            ],
            (api) => api.readWorkloadCountWorkloadCountGet(undefined, this.jobId)
        );
        this.workloadDataSource.loadData();
    }


}
