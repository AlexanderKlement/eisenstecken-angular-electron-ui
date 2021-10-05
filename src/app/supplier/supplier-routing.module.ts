import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SupplierComponent} from './supplier.component';
import {SupplierDetailComponent} from './supplier-detail/supplier-detail.component';
import {SupplierEditComponent} from './supplier-edit/supplier-edit.component';
import {StockDetailComponent} from './stock-detail/stock-detail.component';
import {StockEditComponent} from './stock-edit/stock-edit.component';

const routes: Routes = [
  {
    path: 'supplier',
    component: SupplierComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'supplier/:id',
    component: SupplierDetailComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'supplier/edit/:id',
    component: SupplierEditComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'stock/:id',
    component: StockDetailComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'stock/edit/:id',
    component: StockEditComponent,
    data:{requiresLogin: true}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
