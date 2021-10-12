import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {Journey, Fee, Meal, DefaultService, WorkDay} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {Observable, Subject, Subscriber} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';

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


    workDayLoading = true;
    workDays$: Observable<WorkDay[]>;
    workDay$: Observable<WorkDay>;
    workDaySubscriber$: Subscriber<WorkDay>;
    workDay: WorkDay;

    public buttons: CustomButton[] = [
        {
            name: 'Neuer Arbeitstag',
            navigate: (): void => {
                this.router.navigateByUrl('/work_day/new/' + this.userId.toString());
            }
        }
    ];


    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.userId = parseInt(params.id, 10);
            this.initWorkDays();
            this.initFeeDataSource();
            this.initJourneyDataSource();
            this.initMealDataSource();
        });
        this.workDays$ = this.api.getWorkDaysByUserWorkDayUserUserIdGet(this.userId);
        this.workDay$ = new Observable<WorkDay>(subscriber => {
            console.log('hei');
            console.log(subscriber);
            this.workDaySubscriber$ = subscriber;
        });
    }

    workDayChanged(event: MatSelectChange): void {
        this.workDayLoading = true;
        console.log(event.value);
        this.api.getWorkDayWorkDayWorkDayIdGet(event.value).pipe(first()).subscribe(workDay => {
            console.log(workDay);
            console.log(this.workDaySubscriber$);
            this.workDay = workDay;
            //this.workDaySubscriber$.next(workDay);
            this.workDayLoading = false;
        });
    }

    private initWorkDays() {
        this.api.getCurrentWorkDayByUserWorkDayCurrentUserIdGet(this.userId).pipe(first()).subscribe(workDay => {
            this.todayWorkDay = workDay;
            this.todayWorkDayLoading = false;
        });
        this.api.getFinishedWorkDayByUserWorkDayFinishedUserIdGet(this.userId).pipe(first()).subscribe(workDay => {
            this.finishWorkDay = workDay;
            this.finishedWorkDayLoading = false;
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
                                date: dataSource.date,
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
                {name: 'date', headerName: 'Datum'},
                {name: 'reason', headerName: 'Grund'},
                {name: 'amount', headerName: 'Menge'},
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
                                date: dataSource.date,
                                'car.name': dataSource.car.name,
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
                {name: 'date', headerName: 'Datum'},
                {name: 'car.name', headerName: 'Auto'},
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
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'eating_place.name': dataSource.eating_place.name,
                                date: dataSource.date
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
            ],
            (api) => api.readMealCountMealCountGet(this.userId)
        );
        this.mealDataSource.loadData();
    }
}
