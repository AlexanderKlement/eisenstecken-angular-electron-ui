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
import { ServiceComponent } from './service/service.component';
import { ServiceDialogComponent } from './service/service-dialog/service-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ServiceCreateDialogComponent } from './service/service-create-dialog/service-create-dialog.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    EmployeeComponent,
    EmployeeDetailComponent,
    WorkDayNewComponent,
    MealComponent,
    ServiceComponent,
    ServiceDialogComponent,
    ServiceCreateDialogComponent
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
        FlexModule,
        MatDialogModule,
        MatButtonModule,
        MatDatepickerModule,
        MatInputModule,
        ReactiveFormsModule
    ]
})
export class EmployeeModule { }
