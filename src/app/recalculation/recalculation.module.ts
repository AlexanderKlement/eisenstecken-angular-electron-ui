import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecalculationRoutingModule } from './recalculation-routing.module';
import { RecalculationComponent } from './recalculation.component';
import {SharedModule} from '../shared/shared.module';
import { RecalculationDetailComponent } from './recalculation-detail/recalculation-detail.component';
import { RecalculationEditComponent } from './recalculation-edit/recalculation-edit.component';


@NgModule({
  declarations: [
    RecalculationComponent,
    RecalculationDetailComponent,
    RecalculationEditComponent
  ],
    imports: [
        CommonModule,
        RecalculationRoutingModule,
        SharedModule
    ]
})
export class RecalculationModule { }
