import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ClientComponent} from "./client.component";
import {CommonModule} from "@angular/common";
import {ClientDetailComponent} from "./client-detail/client-detail.component";
import {ClientEditComponent} from "./client-edit/client-edit.component";
import {AccessGuard} from "../shared/services/access-guard.service";

const routes: Routes = [
  {
    path: 'client',
    component: ClientComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'client/:id',
    component: ClientDetailComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'client/edit/:id',
    component: ClientEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
