import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SharedModule} from "../shared/shared.module";
import { AvailableProductsListComponent } from './available-products-list/available-products-list.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";


@NgModule({
  declarations: [
    OrderComponent,
    AvailableProductsListComponent
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
    MatListModule
  ]
})
export class OrderModule { }
