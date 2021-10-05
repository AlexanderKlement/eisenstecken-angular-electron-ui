import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {DefaultService, Lock, Stock, StockCreate, StockUpdate} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-stock-edit',
    templateUrl: './stock-edit.component.html',
    styleUrls: ['./stock-edit.component.scss']
})
export class StockEditComponent extends BaseEditComponent<Stock> implements OnInit, OnDestroy {
    stockGroup: FormGroup;
    navigationTarget = 'stock';

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedStockStockIslockedStockIdGet(id);
    dataFunction = (api: DefaultService, id: number): Observable<Stock> => api.readStockStockStockIdGet(id);
    unlockFunction = (afterUnlockFunction: VoidFunction = () => {
    }): void => {
        this.api.unlockStockStockUnlockStockIdPost(this.id).subscribe(() => {
            afterUnlockFunction();
        });
    };

    ngOnInit(): void {
        super.ngOnInit();
        this.initStockGroup();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    onSubmit(): void {
        this.submitted = true;


        if (this.createMode) {
            const stockCreate: StockCreate = {
                name: this.stockGroup.get('name').value,
            };

            this.api.createStockStockPost(stockCreate).subscribe((stock) => {
                this.createUpdateSuccess(stock);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        } else {
            const stockUpdate: StockUpdate = {
                name: this.stockGroup.get('name').value,
            };

            this.api.updateStockStockStockIdPut(this.id, stockUpdate).subscribe((stock) => {
                this.createUpdateSuccess(stock);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        }
    }

    createUpdateSuccess(stock: Stock): void {
        this.id = stock.id;
        this.unlockFunction(() => {
            this.router.navigateByUrl('stock/' + stock.id.toString());
        });
    }

    private initStockGroup(): void {
        this.stockGroup = new FormGroup({
            name: new FormControl(''),
        });
    }


}
