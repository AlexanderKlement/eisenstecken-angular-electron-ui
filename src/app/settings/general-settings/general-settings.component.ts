import { Component, OnInit } from '@angular/core';
import {DefaultService} from "eisenstecken-openapi-angular-library";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BaseSettingsComponent} from "../base-settings.component";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent extends BaseSettingsComponent  implements OnInit{

  keyList = [
    "general_name",
    "general_address_1",
    "general_address_2",
    "general_tel_1",
    "general_tel_2",
    "general_mail",
    "general_site",
    "general_rea",
    "general_iva",
    "general_pec",
    "general_code",
    "general_job_path",
    "general_order_path",
  ];

  constructor(protected api: DefaultService, protected snackBar: MatSnackBar) {
    super(api, snackBar);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }


}
