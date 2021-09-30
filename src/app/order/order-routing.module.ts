import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccessGuard} from '../shared/access-guard.service';
import {OrderComponent} from './order.component';
import {OrderDetailComponent} from './order-detail/order-detail.component';
import {OrderBundleDetailComponent} from './order-bundle-detail/order-bundle-detail.component';
import {OrderBundleEditComponent} from './order-bundle-edit/order-bundle-edit.component';

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
  {
    path: 'order_bundle/:id',
    component: OrderBundleDetailComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
  {
    path: 'order_bundle/edit/:id',
    component: OrderBundleEditComponent,
    data:{requiresLogin: true},
    canActivate: [ AccessGuard ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
