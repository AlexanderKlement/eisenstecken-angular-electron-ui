import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RecalculationComponent} from './recalculation.component';
import {RecalculationDetailComponent} from './recalculation-detail/recalculation-detail.component';
import {RecalculationEditComponent} from './recalculation-edit/recalculation-edit.component';

const routes: Routes = [
    {
        path: 'recalculation',
        component: RecalculationComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'recalculation/:id',
        component: RecalculationDetailComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'recalculation/edit/:id/:job_id',
        component: RecalculationEditComponent,
        data: {requiresLogin: true}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RecalculationRoutingModule {
}
