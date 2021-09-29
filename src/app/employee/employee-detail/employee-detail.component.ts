import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {Journey, Fee, Meal, DefaultService, WorkDay} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-employee-detail',
    templateUrl: './employee-detail.component.html',
    styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
    feeDataSource: TableDataSource<Fee>;
    journeyDataSource: TableDataSource<Journey>;
    mealDataSource: TableDataSource<Meal>;

    userId: number;

    finishedWorkDayLoading = true;
    todayWorkDayLoading = true;
    finishWorkDay: WorkDay;
    todayWorkDay: WorkDay;

    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.userId = parseInt(params.id, 10);
            this.initFeeDataSource();
            this.initJourneyDataSource();
            this.initMealDataSource();
            //this.api.read
        });

    }

    private initFeeDataSource(): void {
        this.feeDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readFeesFeeGet(skip, limit, filter, this.userId),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                amount: dataSource.amount,
                                reason: dataSource.reason,
                            },
                            route: () => {
                                this.router.navigateByUrl('employee');
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'reason', headerName: 'Grund'},
                {name: 'amount', headerName: 'Menge'}, //TODO: add date here
            ],
            (api) => api.readFeeCountFeeCountGet(this.userId)
        );
        this.feeDataSource.loadData();
    }

    private initJourneyDataSource(): void {
        this.journeyDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readJourneysJourneyGet(skip, limit, filter, this.userId),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                'car.name': dataSource.car.name,
                                date: dataSource.date,
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
                {name: 'car.name', headerName: 'Auto'},
                {name: 'date', headerName: 'Datum'},
                {name: 'distance_km', headerName: 'Distanz [km]'},
            ],
            (api) => api.readJourneyCountJourneyCountGet(this.userId)
        );
        this.journeyDataSource.loadData();
    }

    private initMealDataSource(): void {
        this.mealDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readMealsMealGet(skip, limit, filter, this.userId),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                date: dataSource.date,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'eating_place.name': dataSource.eating_place.name
                            },
                            route: () => {
                                this.router.navigateByUrl('employee');
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'date', headerName: 'Datum'},
                {name: 'eating_place.name', headerName: 'Restaurant'},
            ],
            (api) => api.readMealCountMealCountGet(this.userId)
        );
        this.mealDataSource.loadData();
    }
}
