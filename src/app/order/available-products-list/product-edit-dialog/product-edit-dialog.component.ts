import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {DefaultService, Unit, Vat} from 'eisenstecken-openapi-angular-library';
import {FormControl, FormGroup, Validators} from '@angular/forms';

export interface DialogData {
    title: string;
    name: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    custom_description: string;
    amount: number;
    discount: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    unit_id?: number;
    price: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mod_number: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    vat_id: number;
}

@Component({
    selector: 'app-product-edit-dialog',
    templateUrl: './product-edit-dialog.component.html',
    styleUrls: ['./product-edit-dialog.component.scss']
})
export class ProductEditDialogComponent implements OnInit {

    vatOptions$: Observable<Vat[]>;
    unitOptions$: Observable<Unit[]>;
    productEditGroup: FormGroup;

    constructor(public dialogRef: MatDialogRef<ProductEditDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData, private api: DefaultService) {
    }

    ngOnInit(): void {
        this.vatOptions$ = this.api.readVatsVatGet();
        this.unitOptions$ = this.api.readUnitsUnitGet();
        this.initProductEditGroup();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onAddClick(): void {
        this.dialogRef.close(this.getReturnData());
    }

    private getReturnData(): DialogData {
        return {
            title: this.productEditGroup.get('title').value,
            name: this.productEditGroup.get('name').value,
            description: this.productEditGroup.get('description').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            custom_description: this.productEditGroup.get('custom_description').value,
            amount: this.productEditGroup.get('amount').value,
            discount: this.productEditGroup.get('discount').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            unit_id: this.productEditGroup.get('unit_id').value,
            price: this.productEditGroup.get('price').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            mod_number: this.productEditGroup.get('mod_number').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_id: this.productEditGroup.get('vat_id').value,
        };
    }

    private initProductEditGroup(): void {
        this.productEditGroup = new FormGroup({
            title: new FormControl(this.data.title),
            name: new FormControl(this.data.name, Validators.required),
            description: new FormControl(this.data.description),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            custom_description: new FormControl(this.data.custom_description),
            amount: new FormControl(this.data.amount, Validators.min(0.0000001)),
            discount: new FormControl(this.data.discount, Validators.min(0)),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            unit_id: new FormControl(this.data.unit_id !== null ? this.data.unit_id : 1),
            price: new FormControl(this.data.price, Validators.min(0)),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            mod_number: new FormControl(this.data.mod_number),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_id: new FormControl(this.data.vat_id),
        });
    }
}
