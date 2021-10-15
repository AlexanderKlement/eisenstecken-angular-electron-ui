import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Country, DefaultService} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit {

  @Input() address: FormGroup;
  countryOptions$: Observable<Country[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.countryOptions$ = this.api.readCountriesAddressCountriesGet();
  }
}
