import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {UserComponent} from "./user.component";
import {AccessGuard} from "../shared/services/access-guard.service";
import {UserEditComponent} from "./user-edit/user-edit.component";

const routes: Routes = [
  {
    path: "user",
    component: UserComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: "user/edit/:id",
    component: UserEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
