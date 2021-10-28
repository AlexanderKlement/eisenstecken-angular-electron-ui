import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeComponent } from './employee.component';
import {SharedModule} from '../shared/shared.module';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {WorkDayModule} from '../work-day/work-day.module';
import { WorkDayNewComponent } from './work-day-new/work-day-new.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FlexModule} from '@angular/flex-layout';
import { MealComponent } from './meal/meal.component';


@NgModule({
  declarations: [
    EmployeeComponent,
    EmployeeDetailComponent,
    WorkDayNewComponent,
    MealComponent
  ],
    imports: [
        CommonModule,
        EmployeeRoutingModule,
        SharedModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        WorkDayModule,
        MatFormFieldModule,
        MatSelectModule,
        FlexModule
    ]
})
export class EmployeeModule { }
