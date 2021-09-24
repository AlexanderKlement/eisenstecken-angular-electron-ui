import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WorkDayComponent} from './work-day.component';

const routes: Routes = [
  {
    path: 'work_day',
    component: WorkDayComponent,
    data:{requiresLogin: true}
  },
  {
    path: 'work_day/show',
    component: WorkDayComponent,
    data:{requiresLogin: true}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkDayRoutingModule { }
