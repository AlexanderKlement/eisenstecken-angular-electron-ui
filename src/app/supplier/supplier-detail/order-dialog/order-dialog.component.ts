import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Order} from 'eisenstecken-openapi-angular-library';
import {MatSelectionList} from '@angular/material/list';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

export interface OrderDialogData {
    name: Observable<string>;
    orders: Observable<Order[]>;
}

@Component({
    selector: 'app-order-dialog',
    templateUrl: './order-dialog.component.html',
    styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {

    @ViewChild('orders') ordersSelected: MatSelectionList;
    ordersReady = false;

    constructor(public dialogRef: MatDialogRef<OrderDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: OrderDialogData) {
        this.data.orders.pipe(tap(() => {
            this.ordersReady = true;
        }));
    }

    ngOnInit(): void {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    getSelectedKeys(): number[] {
        if(this.ordersSelected !== undefined){
            return this.ordersSelected.selectedOptions.selected.map((obj) => obj.value);
        } else {
            console.warn('OrderDialogComponent: Cannot get selected Options');
            return [];
        }
    }
}
