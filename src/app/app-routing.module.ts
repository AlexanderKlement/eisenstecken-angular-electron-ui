import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PageNotFoundComponent} from './shared/components';

import {HomeRoutingModule} from './home/home-routing.module';
import {DetailRoutingModule} from './detail/detail-routing.module';
import {LoginRoutingModule} from './login/login-routing.module';
import {AccessGuard} from './shared/access-guard.service';
import {HomeComponent} from './home/home.component';
import {ClientRoutingModule} from './client/client-routing.module';
import {JobRoutingModule} from './job/job-routing.module';
import {CalendarEditComponent} from './shared/components/calendar/calendar-edit/calendar-edit.component';
import {SettingsModule} from './settings/settings.module';
import {UserRoutingModule} from './user/user-routing.module';
import {InvoiceRoutingModule} from './invoice/invoice-routing.module';
import {SupplierRoutingModule} from './supplier/supplier-routing.module';
import {OrderRoutingModule} from './order/order-routing.module';
import {SettingsRoutingModule} from './settings/settings-routing.module';

const routes: Routes = [
    {
        path: '',
        //redirectTo: 'home',
        component: HomeComponent,
        pathMatch: 'full',
        data: { requiresLogin: true },
        //canActivate: [AccessGuard]
    },
    {
        path: 'calendar/:mode/:id',
        component: CalendarEditComponent,
        data: {requiresLogin: true},
        //canActivate: [AccessGuard]
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'}),
        HomeRoutingModule,
        DetailRoutingModule,
        LoginRoutingModule,
        ClientRoutingModule,
        JobRoutingModule,
        OrderRoutingModule,
        SettingsRoutingModule,
        InvoiceRoutingModule,
        UserRoutingModule,
        SupplierRoutingModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
