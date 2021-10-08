import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DeliveryNoteComponent} from './delivery-note.component';
import {DeliveryEditComponent} from './delivery-edit/delivery-edit.component';

const routes: Routes = [
    {
        path: 'delivery_note',
        component: DeliveryNoteComponent,
        data: {requiresLogin: true}
    },
    {
        path: 'delivery_note/:id',
        component: DeliveryEditComponent,
        data: {requiresLogin: true}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DeliveryNoteRoutingModule {
}
