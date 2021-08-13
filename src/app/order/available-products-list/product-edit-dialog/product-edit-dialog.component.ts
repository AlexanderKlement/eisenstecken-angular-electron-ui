import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {DefaultService, Unit, Vat} from "eisenstecken-openapi-angular-library";

export interface DialogData {
  title: string;
  name: string;
  description: string;
  custom_description: string;
  amount: number;
  discount: number;
  unit_id?: number;
  price: number;
  mod_number: string;
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

  constructor(public dialogRef: MatDialogRef<ProductEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, private api: DefaultService) { }

  ngOnInit(): void {
    this.vatOptions$ = this.api.readVatsVatGet();
    this.unitOptions$ = this.api.readUnitsUnitGet();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
