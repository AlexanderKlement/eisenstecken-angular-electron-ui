import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryNoteRoutingModule } from './delivery-note-routing.module';
import { DeliveryNoteComponent } from './delivery-note.component';
import {SharedModule} from '../shared/shared.module';
import { DeliveryEditComponent } from './delivery-edit/delivery-edit.component';


@NgModule({
  declarations: [
    DeliveryNoteComponent,
    DeliveryEditComponent
  ],
    imports: [
        CommonModule,
        DeliveryNoteRoutingModule,
        SharedModule
    ]
})
export class DeliveryNoteModule { }
