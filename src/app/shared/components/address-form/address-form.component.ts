import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Country} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent implements OnInit {

  @Input() address: FormGroup;
  @Input() countryOptions$: Observable<Country[]>; //TODO: maybe remove the dependency and get it directly from here

  constructor() { }

  ngOnInit(): void {
  }
}
