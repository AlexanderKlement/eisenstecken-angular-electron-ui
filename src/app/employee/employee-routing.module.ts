import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EmployeeComponent} from './employee.component';
import {EmployeeDetailComponent} from './employee-detail/employee-detail.component';
import {WorkDayNewComponent} from './work-day-new/work-day-new.component';

const routes: Routes = [
    {
        path: 'employee',
        component: EmployeeComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'employee/:id',
        component: EmployeeDetailComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'work_day/new/:id',
        component: WorkDayNewComponent,
        data: {requiresLogin: true}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeRoutingModule {
}