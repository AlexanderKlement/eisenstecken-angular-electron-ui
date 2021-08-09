import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobRoutingModule } from './job-routing.module';
import { JobComponent } from './job.component';
import {SharedModule} from "../shared/shared.module";
import { JobDetailComponent } from './job-detail/job-detail.component';
import { JobEditComponent } from './job-edit/job-edit.component';
import {FlexModule} from "@angular/flex-layout";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import { JobStatusBarComponent } from './job-detail/job-status-bar/job-status-bar.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import { OfferEditComponent } from './offer-edit/offer-edit.component';
import { OrderedArticleEditComponent } from './offer-edit/ordered-article-edit/ordered-article-edit.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatCheckboxModule} from "@angular/material/checkbox";


@NgModule({
  declarations: [
    JobComponent,
    JobDetailComponent,
    JobEditComponent,
    JobStatusBarComponent,
    OfferEditComponent,
    OrderedArticleEditComponent
  ],
  imports: [
    CommonModule,
    JobRoutingModule,
    SharedModule,
    FlexModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatCheckboxModule
  ]
})
export class JobModule { }
