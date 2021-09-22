import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkDayRoutingModule } from './work-day-routing.module';
import { WorkDayComponent } from './work-day.component';
import {SharedModule} from '../shared/shared.module';
import {FlexModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';


@NgModule({
  declarations: [
    WorkDayComponent
  ],
    imports: [
        CommonModule,
        WorkDayRoutingModule,
        SharedModule,
        FlexModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule
    ]
})
export class WorkDayModule { }
