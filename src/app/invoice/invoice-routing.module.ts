import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {InvoiceComponent} from './invoice.component';

const routes: Routes = [
  {
    path: 'invoice',
    component: InvoiceComponent,
    data:{requiresLogin: true}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
