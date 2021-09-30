import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Fee, Journey, MealSum, User, WorkDay} from 'eisenstecken-openapi-angular-library';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {LockService} from '../shared/lock.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-employee',
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

    userDataSource: TableDataSource<User>;
    feeDataSource: TableDataSource<Fee>;
    journeyDataSource: TableDataSource<Journey>;
    mealDataSource: TableDataSource<MealSum>;

    public buttons: CustomButton[] = [
        {
            name: 'Neuer Benutzer',
            navigate: (): void => {
                this.router.navigateByUrl('/user/edit/new');
            }
        }
    ];

    constructor(private api: DefaultService, private locker: LockService, private router: Router) {
    }

    ngOnInit(): void {
        this.initUserDataSource();
        this.initFeeDataSource();
        this.initJourneyDataSource();
        this.initMealDataSource();
    }

    private initUserDataSource(): void {
        this.userDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readUsersUsersGet(skip, filter, limit, true),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                fullname: dataSource.fullname,
                            },
                            route: () => {
                                this.router.navigateByUrl('/employee/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'fullname', headerName: 'Name'},
            ],
            (api) => api.readUserCountUsersCountGet(true),
        );
        this.userDataSource.loadData();
    }

    private initFeeDataSource(): void {
        this.feeDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readFeesFeeGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                'user.fullname': dataSource.user.fullname,
                                amount: dataSource.amount,
                                reason: dataSource.reason,
                                date: moment(dataSource.date).format('L')
                            },
                            route: () => {
                                this.router.navigateByUrl('employee');
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'user.fullname', headerName: 'Benutzer'},
                {name: 'date', headerName: 'Datum'},
                {name: 'reason', headerName: 'Grund'},
                {name: 'amount', headerName: 'Menge [€]'},
            ],
            (api) => api.readFeeCountFeeCountGet()
        );
        this.feeDataSource.loadData();
    }

    private initJourneyDataSource(): void {
        this.journeyDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readJourneysJourneyGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                'user.fullname': dataSource.user.fullname,
                                'car.name': dataSource.car.name,
                                date: moment(dataSource.date).format('L'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                distance_km: dataSource.distance_km,
                            },
                            route: () => {
                                this.router.navigateByUrl('employee');
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'user.fullname', headerName: 'Benutzer'},
                {name: 'date', headerName: 'Datum'},
                {name: 'car.name', headerName: 'Auto'},
                {name: 'distance_km', headerName: 'Distanz [km]'},
            ],
            (api) => api.readJourneyCountJourneyCountGet()
        );
        this.journeyDataSource.loadData();
    }

    private initMealDataSource(): void {
        this.mealDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readMealSumsMealSumGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                date: moment(dataSource.date).format('L'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'eating_place.name': dataSource.eating_place.name,
                                sum: dataSource.sum
                            },
                            route: () => {
                                this.router.navigateByUrl('employee');
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'eating_place.name', headerName: 'Restaurant'},
                {name: 'date', headerName: 'Datum'},
                {name: 'sum', headerName: 'Anzahl'}
            ],
            (api) => api.readMealCountMealCountGet()
        );
        this.mealDataSource.loadData();
    }

}
