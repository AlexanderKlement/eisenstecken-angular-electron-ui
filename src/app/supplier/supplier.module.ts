import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SupplierRoutingModule} from './supplier-routing.module';
import {SupplierDetailComponent} from './supplier-detail/supplier-detail.component';
import {SupplierEditComponent} from './supplier-edit/supplier-edit.component';
import {SharedModule} from '../shared/shared.module';
import {JobModule} from '../job/job.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {MatTabsModule} from '@angular/material/tabs';
import {OrderDialogComponent} from './supplier-detail/order-dialog/order-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {SupplierComponent} from './supplier.component';


@NgModule({
    declarations: [
        SupplierComponent,
        SupplierDetailComponent,
        SupplierEditComponent,
        OrderDialogComponent
    ],
    imports: [
        CommonModule,
        SupplierRoutingModule,
        SharedModule,
        JobModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        FlexModule,
        MatTabsModule,
        MatDialogModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatDatepickerModule
    ]
})
export class SupplierModule {
}
