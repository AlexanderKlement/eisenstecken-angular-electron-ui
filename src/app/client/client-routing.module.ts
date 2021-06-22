import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ClientComponent} from "./client.component";
import {CommonModule} from "@angular/common";

const routes: Routes = [
  {
    path: 'client',
    component: ClientComponent,
    data:{requiresLogin: true}
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
