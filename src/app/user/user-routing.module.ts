import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UserComponent} from "./user.component";
import {AccessGuard} from "../shared/access-guard.service";

const routes: Routes = [
  {
    path: "user",
    component: UserComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
