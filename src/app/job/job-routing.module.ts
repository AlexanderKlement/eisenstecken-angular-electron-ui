import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {JobComponent} from "./job.component";
import {JobDetailComponent} from "./job-detail/job-detail.component";
import {JobEditComponent} from "./job-edit/job-edit.component";
import {OfferEditComponent} from "./offer-edit/offer-edit.component";
import {AccessGuard} from "../shared/access-guard.service";

const routes: Routes = [
  {
    path: 'job',
    component: JobComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'job/:id',
    component: JobDetailComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'job/edit/:id',
    component: JobEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'job/:id/new',
    component: JobEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'job/edit/:id/:client_id/',
    component: JobEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'job/edit/:id/:job_id/:sub',
    component: JobEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'offer/edit/:id',
    component: OfferEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'offer/edit/:id/:job_id',
    component: OfferEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobRoutingModule { }
