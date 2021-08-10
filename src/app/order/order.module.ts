import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SharedModule} from "../shared/shared.module";
import { ProductsListComponent } from './available-products-list/products-list.component';


@NgModule({
  declarations: [
    OrderComponent,
    ProductsListComponent
  ],
    imports: [
        CommonModule,
        OrderRoutingModule,
        MatGridListModule,
        FlexLayoutModule,
        MatProgressSpinnerModule,
        SharedModule
    ]
})
export class OrderModule { }
