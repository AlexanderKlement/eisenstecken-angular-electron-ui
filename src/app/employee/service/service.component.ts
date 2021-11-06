import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Service} from 'eisenstecken-openapi-angular-library';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as moment from 'moment';
import {ActivatedRoute} from '@angular/router';
import {WorkDayGeneralComponent} from '../../work-day/work-day-general/work-day-general.component';
import {ServiceDialogComponent} from './service-dialog/service-dialog.component';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {ServiceCreateDialogComponent} from './service-create-dialog/service-create-dialog.component';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-service',
    templateUrl: './service.component.html',
    styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
    serviceDataSource: TableDataSource<Service>;
    userId: number;
    buttons: CustomButton[] = [
        {
            name: 'Wartung erstellen',
            navigate: () => {
                this.serviceCreateClicked();
            }
        }
    ];
    title = '';

    constructor(private api: DefaultService, private dialog: MatDialog, private snackBar: MatSnackBar, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.userId = parseInt(params.id, 10);
            if (isNaN(this.userId)) {
                console.error('ServiceComponent: Could not parse userId');
            }
            this.api.readUserUsersUserIdGet(this.userId).pipe(first()).subscribe(user => {
                this.title = 'Service: ' + user.fullname;
            });
            this.initServiceDataSource();
        });

    }

    private initServiceDataSource(): void {
        this.serviceDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readServicesServiceGet(skip, limit, filter, this.userId),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                date: moment(dataSource.date).format('dddd, DD.MM.YYYY'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'user.fullname': dataSource.user.fullname,
                                minutes: WorkDayGeneralComponent.minutesToDisplayableString(dataSource.minutes),
                            },
                            route: () => {
                                this.serviceClicked(dataSource.id);
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'date', headerName: 'Datum'},
                {name: 'user.fullname', headerName: 'Angestellter'},
                {name: 'minutes', headerName: 'Zeit'},
            ],
            (api) => api.readServiceCountServiceCountGet(this.userId)
        );
        this.serviceDataSource.loadData();
    }

    private serviceClicked(id: number) {
        const dialogRef = this.dialog.open(ServiceDialogComponent, {
            width: '900px',
            data: {id}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.serviceDataSource.loadData();
            }
        });
    }

    private serviceCreateClicked() {
        const dialogRef = this.dialog.open(ServiceCreateDialogComponent, {
            width: '900px',
            data: {userId: this.userId}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.serviceDataSource.loadData();
            }
        });
    }
}
