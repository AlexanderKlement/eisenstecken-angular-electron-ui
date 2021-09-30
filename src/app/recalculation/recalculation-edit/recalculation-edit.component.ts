import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {DefaultService, Job, Lock, Recalculation} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-recalculation-edit',
    templateUrl: './recalculation-edit.component.html',
    styleUrls: ['./recalculation-edit.component.scss']
})
export class RecalculationEditComponent extends BaseEditComponent<Recalculation> implements OnInit, OnDestroy {
    recalculationGroup: FormGroup;
    navigationTarget = 'recalculation';
    jobId: number;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> =>
        api.islockedRecalculationRecalculationIslockedRecalculationIdGet(id);
    dataFunction = (api: DefaultService, id: number): Observable<Recalculation> =>
        api.readRecalculationsRecalculationRecalculationIdGet(id);
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
        });
    }

    // TODO: make reset button

    initRecalculationsGroup(): void {
        this.recalculationGroup = new FormGroup({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            wood_amount: new FormControl(''),
            orders: new FormArray([]),
            workloads: new FormArray([]),
            expenses: new FormArray([]),
        });

        if (this.createMode) {
            this.initCreate();
        }
    }

    initCreate() {
        this.api.readOrdersToOrderToOrderableToIdGet(this.jobId).pipe(first()).subscribe(orders => {
            console.log(orders);
        });
    }

    getOrdersFromArray(): FormArray {
        return this.recalculationGroup.get('orders') as FormArray;
    }

    initOrder(order): FormGroup {
        return new FormGroup({});
    }


}
