import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SettingsComponent} from "./settings.component";
import {AccessGuard} from "../shared/services/access-guard.service";

const routes: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
