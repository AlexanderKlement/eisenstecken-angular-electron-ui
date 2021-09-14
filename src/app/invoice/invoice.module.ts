import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import {SharedModule} from '../shared/shared.module';
import {MatTabsModule} from '@angular/material/tabs';
import { IngoingComponent } from './ingoing/ingoing.component';
import { OutgoingComponent } from './outgoing/outgoing.component';


@NgModule({
  declarations: [
    InvoiceComponent,
    IngoingComponent,
    OutgoingComponent
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    SharedModule,
    MatTabsModule
  ]
})
export class InvoiceModule { }
