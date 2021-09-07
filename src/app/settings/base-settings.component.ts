import { OnInit } from '@angular/core';
import {DefaultService, ParameterCreate} from "eisenstecken-openapi-angular-library";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl, FormGroup} from "@angular/forms";
import {first} from "rxjs/operators";

export abstract class BaseSettingsComponent implements OnInit {

  abstract keyList: string[];

  formGroup: FormGroup;
  submitted = false;

  protected constructor(protected api: DefaultService, protected snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({});
    this.keyList.forEach((key) => {
      this.formGroup.addControl(key, new FormControl(""));
    });
    this.getAndPushParametersOntoFormGroup();
  }

  private getAndPushParametersOntoFormGroup(): void{
    this.api.getBulkParameterByKeyParameterBulkGetPost(this.keyList).pipe(first()).subscribe((parameters) => {
      parameters.forEach((parameter) => {
        this.formGroup.patchValue({
          [parameter.key]: parameter.value
        });
      });
    });
  }

  private getParametersFromFromGroupAndPushToServer(): void {
    const parameters: ParameterCreate[] = [];
    this.keyList.forEach((key) => {
      parameters.push({
        key: key,
        value: this.formGroup.get(key).value
      });
    });
    this.api.setBulkParameterByKeyParameterBulkSetPost(parameters).pipe(first()).subscribe((success) => {
      if(success){
        this.snackBar.open("Gespeichert", "Ok", {
          duration: 3000
        });
      } else {
        console.error("Save did not work"); //This should not be possible atm
      }
    }, (error) => {
      console.error(error);
    }, () => {
      this.submitted = false;
    });
  }

  public onSubmit() : void {
    this.submitted = true;
    this.getParametersFromFromGroupAndPushToServer();
  }


}
