import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import {AccessGuard} from '../shared/access-guard.service';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
