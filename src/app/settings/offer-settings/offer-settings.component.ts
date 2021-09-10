import { Component, OnInit } from '@angular/core';
import {BaseSettingsComponent} from '../base-settings.component';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-offer-settings',
  templateUrl: './offer-settings.component.html',
  styleUrls: ['./offer-settings.component.scss']
})
export class OfferSettingsComponent extends BaseSettingsComponent  implements OnInit {

  keyList = [
    'offer_title_introduction_de',
    'offer_title_introduction_it',
    'offer_in_price_included_de',
    'offer_in_price_included_it',
    'offer_validity_de',
    'offer_validity_it',
    'offer_delivery_de',
    'offer_delivery_it',
    'offer_payment_de',
    'offer_payment_it',
    'offer_name_de',
    'offer_name_it',
    'offer_position_de',
    'offer_position_it',
  ];


  constructor(protected api: DefaultService, protected snackBar: MatSnackBar) {
    super(api, snackBar);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
