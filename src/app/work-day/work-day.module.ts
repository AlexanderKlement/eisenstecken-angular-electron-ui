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
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { WorkDayGeneralComponent } from './work-day-general/work-day-general.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { StopwatchComponent } from './work-day-general/stopwatch/stopwatch.component';


@NgModule({
    declarations: [
        WorkDayComponent,
        WorkDayGeneralComponent,
        StopwatchComponent
    ],
    exports: [
        WorkDayGeneralComponent
    ],
    imports: [
        CommonModule,
        WorkDayRoutingModule,
        SharedModule,
        FlexModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        NgxMaterialTimepickerModule,
        MatDatepickerModule
    ]
})
export class WorkDayModule { }
