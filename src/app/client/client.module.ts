import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import {SharedModule} from "../shared/shared.module";
import {ClientEditComponent} from "./client-edit/client-edit.component";
import {ClientDetailComponent} from "./client-detail/client-detail.component";


@NgModule({
  declarations: [
    ClientComponent,
    ClientEditComponent,
    ClientDetailComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    SharedModule,
  ]
})
export class ClientModule { }
