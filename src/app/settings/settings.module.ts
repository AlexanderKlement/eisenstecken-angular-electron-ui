import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import {SharedModule} from '../shared/shared.module';
import {SettingsComponent} from './settings.component';
import {MatTabsModule} from '@angular/material/tabs';
import { OfferSettingsComponent } from './offer-settings/offer-settings.component';
import { InvoiceSettingsComponent } from './invoice-settings/invoice-settings.component';
import { DeliverySettingsComponent } from './delivery-settings/delivery-settings.component';
import { OrderSettingsComponent } from './order-settings/order-settings.component';
import { ReminderSettingsComponent } from './reminder-settings/reminder-settings.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    SettingsComponent,
    OfferSettingsComponent,
    InvoiceSettingsComponent,
    DeliverySettingsComponent,
    OrderSettingsComponent,
    ReminderSettingsComponent,
    GeneralSettingsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTabsModule,
    ReactiveFormsModule,
    FlexModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class SettingsModule { }
