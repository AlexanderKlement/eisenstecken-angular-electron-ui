import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {Journey, Fee, Meal, DefaultService, WorkDay, Service} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {Observable, Subject, Subscriber} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';
import * as moment from 'moment';
import {WorkDayGeneralComponent} from '../../work-day/work-day-general/work-day-general.component';
import {ServiceDialogComponent} from '../service/service-dialog/service-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ServiceCreateDialogComponent} from '../service/service-create-dialog/service-create-dialog.component';

@Component({
    selector: 'app-employee-detail',
    templateUrl: './employee-detail.component.html',
    styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
    feeDataSource: TableDataSource<Fee>;
    journeyDataSource: TableDataSource<Journey>;
    mealDataSource: TableDataSource<Meal>;
    serviceDataSource: TableDataSource<Service>;

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

    serviceTabIndex = 4;

    public buttons: CustomButton[] = [
        {
            name: 'Neuer Arbeitstag',
            navigate: (): void => {
                this.router.navigateByUrl('/work_day/new/' + this.userId.toString());
            }
        }
    ];
    title = '';


    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.userId = parseInt(params.id, 10);
            if (isNaN(this.userId)) {
                console.error('EmployeeDetailComponent: Could not parse userId');
            }
            this.api.readUserUsersUserIdGet(this.userId).pipe(first()).subscribe(user => {
                this.title = 'Stundenzettel: ' + user.fullname;
            });
            this.initWorkDays();
            this.initFeeDataSource();
            this.initJourneyDataSource();
            this.initMealDataSource();
            this.initServiceDataSource();
        });
        this.workDays$ = this.api.getWorkDaysByUserWorkDayUserUserIdGet(this.userId);
        this.workDay$ = new Observable<WorkDay>(subscriber => {
            this.workDaySubscriber$ = subscriber;
        });
    }

    workDayChanged(event: MatSelectChange): void {
        this.workDayLoading = true;
        this.api.getWorkDayWorkDayWorkDayIdGet(event.value).pipe(first()).subscribe(workDay => {
            this.workDay = workDay;
            //this.workDaySubscriber$.next(workDay);
            this.workDayLoading = false;
        });
    }

    selectedTabChanged($event: number) {
        const buttonName = 'Wartung erstellen';
        if ($event === this.serviceTabIndex) {
            this.buttons.push({
                name: buttonName,
                navigate: () => {
                    this.serviceCreateClicked();
                }
            });
        } else {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].name === buttonName) {
                    this.buttons.splice(i, 1);
                    break;
                }
            }
        }
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
