import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobRoutingModule } from './job-routing.module';
import { JobComponent } from './job.component';
import {SharedModule} from "../shared/shared.module";
import { JobDetailComponent } from './job-detail/job-detail.component';
import { JobEditComponent } from './job-edit/job-edit.component';
import {FlexModule} from "@angular/flex-layout";


@NgModule({
  declarations: [
    JobComponent,
    JobDetailComponent,
    JobEditComponent
  ],
  imports: [
    CommonModule,
    JobRoutingModule,
    SharedModule,
    FlexModule
  ]
})
export class JobModule { }
