import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryNoteRoutingModule } from './delivery-note-routing.module';
import { DeliveryNoteComponent } from './delivery-note.component';


@NgModule({
  declarations: [
    DeliveryNoteComponent
  ],
  imports: [
    CommonModule,
    DeliveryNoteRoutingModule
  ]
})
export class DeliveryNoteModule { }
