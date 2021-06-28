import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {JobComponent} from "./job.component";
import {JobDetailComponent} from "./job-detail/job-detail.component";

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobRoutingModule { }
