import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SharedModule} from "../shared/shared.module";
import { ProductsListComponent } from './available-products-list/products-list.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import { ProductEditDialogComponent } from './available-products-list/product-edit-dialog/product-edit-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatSelectModule} from "@angular/material/select";


@NgModule({
  declarations: [
    OrderComponent,
    ProductsListComponent,
    ProductEditDialogComponent
  ],
  imports: [
    CommonModule,
    OrderRoutingModule,
    MatGridListModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    SharedModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule
  ]
})
export class OrderModule { }
