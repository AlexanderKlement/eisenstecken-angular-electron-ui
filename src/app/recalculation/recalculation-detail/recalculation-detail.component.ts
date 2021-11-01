import {Component, OnInit} from '@angular/core';
import {DefaultService, Expense, Order, Recalculation, Workload} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import * as moment from 'moment';
import {first, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {LockService} from '../../shared/services/lock.service';
import {AuthService} from '../../shared/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
    selector: 'app-recalculation-detail',
    templateUrl: './recalculation-detail.component.html',
    styleUrls: ['./recalculation-detail.component.scss']
})
export class RecalculationDetailComponent implements OnInit {

    jobId: number;
    loading = true;
    recalculation: Recalculation;

    orderDataSource: TableDataSource<Order>;
    workloadDataSource: TableDataSource<Workload>;
    expenseDataSource: TableDataSource<Expense>;
    jobName$: Observable<string>;

    buttons: CustomButton[] = [];

    constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute,
                private locker: LockService, private authService: AuthService, private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.jobId = parseInt(params.id, 10);
            if (isNaN(this.jobId)) {
                console.error('RecalculationDetail: Cannot parse jobId');
                this.router.navigateByUrl('recalculation');
                return;
            }
            this.api.readRecalculationByJobRecalculationJobJobIdGet(this.jobId).pipe().subscribe(recalculation => {
                if (recalculation === undefined || recalculation === null) {
                    this.authService.currentUserHasRight('recalculations:create').pipe(first()).subscribe(allowed => {
                        if (allowed) {
                            this.router.navigateByUrl('recalculation/edit/new/' + this.jobId.toString());
                        } else {
                            this.snackBar.open('Sie sind nicht berechtigt Nachkalkulationen zu erstellen!'
                                , 'Ok',{
                                duration: 10000
                              });
                            this.router.navigateByUrl('recalculation');
                        }
                    });

                    return;
                }
                this.recalculation = recalculation;
                this.initRecalculation();
                this.loading = false;
            });
        });
        this.authService.currentUserHasRight('recalculations:modify').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Bearbeiten',
                    navigate: () => {
                        this.editButtonClicked();
                    }
                });
            }
        });
    }

    initRecalculation(): void {
        this.initOrderTable();
        this.initWorkloadTable();
        this.initExpenseTable();
        this.jobName$ = this.api.readJobJobJobIdGet(this.jobId).pipe(
            first(),
            map(job => 'Nachkalkulation: ' + job.displayable_name)
        );
    }

    private initOrderTable() {
        this.orderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersToOrderToOrderableToIdGet(this.jobId, skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.displayable_name': dataSource.order_to.displayable_name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_from.displayable_name': dataSource.order_from.displayable_name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                create_date: moment(dataSource.create_date).format('L'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                delivery_date: dataSource.delivery_date === null ? '' : moment(dataSource.delivery_date).format('L'),
                                status: dataSource.status_translation,
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'order_to.displayable_name', headerName: 'Ziel'},
                {name: 'order_from.displayable_name', headerName: 'Herkunft'},
                {name: 'create_date', headerName: 'Erstelldatum'},
                {name: 'delivery_date', headerName: 'Lieferdatum'},
                {name: 'status', headerName: 'Status'},
            ],
            (api) => api.readOrdersToCountOrderToOrderableToIdCountGet(this.jobId)
        );
        this.orderDataSource.loadData();
    }

    private initWorkloadTable() {
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
                                //this.router.navigateByUrl('/order/' + dataSource.id.toString());
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

    private initExpenseTable() {
        this.expenseDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readExpensesExpenseGet(skip, limit, filter, this.recalculation.id),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                amount: dataSource.amount,
                            },
                            route: () => {
                                //this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Beschreibung'},
                {name: 'amount', headerName: 'Menge [€]'},
            ],
            (api) => api.readExpenseCountExpenseCountGet(this.recalculation.id)
        );
        this.expenseDataSource.loadData();
    }

    private editButtonClicked(): void {
        this.locker.getLockAndTryNavigate(
            this.api.islockedRecalculationRecalculationIslockedRecalculationIdGet(this.recalculation.id),
            this.api.lockRecalculationRecalculationLockRecalculationIdPost(this.recalculation.id),
            this.api.unlockRecalculationRecalculationUnlockRecalculationIdPost(this.recalculation.id),
            'recalculation/edit/' + this.recalculation.id.toString() + '/' + this.jobId.toString()
        );
    }
}
