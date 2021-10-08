import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {
    DefaultService,
    Expense, ExpenseCreate, Job,
    Lock, Order,
    Recalculation,
    RecalculationCreate, RecalculationUpdate, Workload
} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import * as moment from 'moment';

@Component({
    selector: 'app-recalculation-edit',
    templateUrl: './recalculation-edit.component.html',
    styleUrls: ['./recalculation-edit.component.scss']
})
export class RecalculationEditComponent extends BaseEditComponent<Recalculation> implements OnInit, OnDestroy {
    recalculationGroup: FormGroup;
    navigationTarget = 'recalculation';
    jobId: number;
    jobName$: Observable<string>;

    orderDataSource: TableDataSource<Order>;
    workloadDataSource: TableDataSource<Workload>;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> =>
        api.islockedRecalculationRecalculationIslockedRecalculationIdGet(id);
    dataFunction = (api: DefaultService, id: number): Observable<Recalculation> =>
        api.readRecalculationRecalculationRecalculationIdGet(id);
    unlockFunction = (afterUnlockFunction: VoidFunction = () => {
    }): void => {
        this.api.unlockRecalculationRecalculationUnlockRecalculationIdPost(this.id).subscribe(() => {
            afterUnlockFunction();
        });
    };

    ngOnInit(): void {
        super.ngOnInit();
        this.initRecalculationsGroup();
        this.routeParams.subscribe((params) => {
            this.jobId = parseInt(params.job_id, 10);
            if (isNaN(this.jobId)) {
                console.error('RecalculationEdit: Cannot parse job id');
                this.router.navigateByUrl(this.navigationTarget);
            }
            console.log(this.jobId);
            this.initOrderTable();
            this.initWorkloadTable();
            this.jobName$ = this.api.readJobJobJobIdGet(this.jobId).pipe(
                first(),
                map(job => job.displayable_name)
            );
            if (this.createMode) {
                this.addExpense();
            } else {
                this.api.readRecalculationRecalculationRecalculationIdGet(this.id).pipe(first()).subscribe(recalculation => {
                    this.fillFormGroup(recalculation);
                });
            }
        });

    }

    initRecalculationsGroup(): void {
        this.recalculationGroup = new FormGroup({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            wood_amount: new FormControl(''),
            expenses: new FormArray([]),
        });
    }

    fillFormGroup(recalculation: Recalculation): void {
        this.recalculationGroup.get('wood_amount').setValue(recalculation.wood_amount);
        for (const expense of recalculation.expenses) {
            this.addExpense(expense);
        }
    }

    getExpenses(): FormArray {
        return this.recalculationGroup.get('expenses') as FormArray;
    }

    removeExpenseAt(index: number): void {
        this.getExpenses().removeAt(index);
    }

    addExpense(expense?: Expense): void {
        this.getExpenses().push(this.createExpense(expense));
    }

    createExpense(expense?: Expense): FormGroup {
        if (expense !== undefined) {
            return new FormGroup({
                id: new FormControl(expense.id),
                amount: new FormControl(expense.amount),
                name: new FormControl(expense.name)
            });
        } else {
            return new FormGroup({
                id: new FormControl(0),
                amount: new FormControl(0),
                name: new FormControl('')
            });
        }
    }


    onSubmit() {
        const expenses: ExpenseCreate[] = [];
        for (const expenseGroup of this.getExpenses().controls) {
            expenses.push({
                name: expenseGroup.get('name').value,
                amount: expenseGroup.get('amount').value,
            });
        }
        if (this.createMode) {
            const recalculationCreate: RecalculationCreate = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                wood_amount: this.recalculationGroup.get('wood_amount').value,
                expenses
            };
            this.api.createRecalculationRecalculationJobIdPost(this.jobId, recalculationCreate).pipe(first()).subscribe(recalculation => {
                this.router.navigateByUrl('recalculation/' + this.jobId);
            });
        } else {
            const recalculationUpdate: RecalculationUpdate = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                wood_amount: this.recalculationGroup.get('wood_amount').value,
                expenses
            };
            this.api.updateRecalculationRecalculationJobIdPut(this.jobId, recalculationUpdate).pipe(first()).subscribe(recalculation => {
                this.router.navigateByUrl('recalculation/' + this.jobId);
            });
        }
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
}
