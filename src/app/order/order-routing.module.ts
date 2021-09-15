import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccessGuard} from '../shared/access-guard.service';
import {OrderComponent} from './order.component';
import {OrderDetailComponent} from './order-detail/order-detail.component';

const routes: Routes = [
  {
    path: 'order',
    component: OrderComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'order/:id',
    component: OrderDetailComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
