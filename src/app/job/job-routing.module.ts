import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {JobComponent} from "./job.component";
import {JobDetailComponent} from "./job-detail/job-detail.component";
import {JobEditComponent} from "./job-edit/job-edit.component";

const routes: Routes = [
  {
    path: 'job',
    component: JobComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'job/:id',
    component: JobDetailComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'job/edit/:id',
    component: JobEditComponent,
    data:{requiresLogin: true}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobRoutingModule { }
