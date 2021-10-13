import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {JobComponent} from './job.component';
import {JobDetailComponent} from './job-detail/job-detail.component';
import {JobEditComponent} from './job-edit/job-edit.component';
import {OfferEditComponent} from './offer-edit/offer-edit.component';
import {AccessGuard} from '../shared/access-guard.service';
import {OutgoingInvoiceEditComponent} from './outgoing-invoice-edit/outgoing-invoice-edit.component';
import {WorkHoursComponent} from './work-hours/work-hours.component';

const routes: Routes = [
    {
        path: 'job',
        component: JobComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'job/:id',
        component: JobDetailComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'job/edit/:id',
        component: JobEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'job/:id/new',
        component: JobEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'job/edit/:id/:client_id',
        component: JobEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'job/edit/:id/:job_id/:sub',
        component: JobEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'offer/edit/:id',
        component: OfferEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'offer/edit/:id/:job_id',
        component: OfferEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'outgoing_invoice/edit/:id',
        component: OutgoingInvoiceEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'outgoing_invoice/edit/:id/:job_id',
        component: OutgoingInvoiceEditComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
    {
        path: 'work_hours/:job_id',
        component: WorkHoursComponent,
        data: {requiresLogin: true},
        canActivate: [AccessGuard]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JobRoutingModule {
}
