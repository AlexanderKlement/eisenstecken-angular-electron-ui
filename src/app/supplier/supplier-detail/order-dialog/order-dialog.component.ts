import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Order} from 'eisenstecken-openapi-angular-library';
import {MatSelectionList} from '@angular/material/list';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import * as moment from 'moment';
import {MatDatepicker} from '@angular/material/datepicker';
import {FormControl} from '@angular/forms';

export interface OrderDialogData {
    name: Observable<string>;
    orders: Observable<Order[]>;
}

export interface OrderDateReturnData {
    orders: number[];
    date: string;
}

@Component({
    selector: 'app-order-dialog',
    templateUrl: './order-dialog.component.html',
    styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {

    @ViewChild('orders') ordersSelected: MatSelectionList;
    @ViewChild('date') dateSelected: MatDatepicker<Date>;
    ordersReady = false;
    dateControl: FormControl;
    error = false;

    constructor(public dialogRef: MatDialogRef<OrderDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: OrderDialogData) {
        this.data.orders.pipe(tap(() => {
            this.ordersReady = true;
        }));
    }

    ngOnInit(): void {
        this.dateControl = new FormControl(new Date());
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

    getReturnData(): OrderDateReturnData {
        if(this.error){
            return;
        }
        const date =  moment(this.dateControl.value);
        const keys =  this.getSelectedKeys();
        if(!date.isValid() || keys.length === 0){
            this.error = true;
        }
        return {
            orders : keys,
            date : date.format()
        };
    }
}
