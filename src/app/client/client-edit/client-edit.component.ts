import { Component, OnInit } from '@angular/core';
import {DefaultService, Client, Lock, Gender, Language, Country, ClientCreate} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-client-edit',
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.scss']
})
export class ClientEditComponent extends BaseEditComponent<Client>  implements OnInit {

  navigationTarget = "/client";
  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedClientClientIslockedClientIdGet(id);
  };
  dataFunction = (api: DefaultService, id: number): Observable<Client> => {
    return api.readClientClientClientIdGet(id);
  };


  clientGroup: FormGroup;

  //TODO: make this extended:
  /*
  "esigibilita_iva": "string",
  "publica_amministrazione": true,
  "cup": "string",
  "cig": "string",
   */

  submitted = false;

  company= false;

  genderOptions$: Observable<Gender[]>;
  languageOptions$: Observable<Language[]>;
  countryOptions$: Observable<Country[]>;


  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.genderOptions$ = this.api.readGendersGenderGet();
    this.languageOptions$ = this.api.readLanguagesLanguageGet();
    this.countryOptions$ = this.api.readCountriesAddressCountriesGet();
    this.clientGroup = new FormGroup({
      name: new FormControl(""),
      lastname: new FormControl(""),
      isCompany: new FormControl(""),
      mail1: new FormControl(""),
      mail2: new FormControl(""),
      tel1: new FormControl(""),
      tel2: new FormControl(""),
      vat_number: new FormControl(""),
      fiscal_code: new FormControl(""),
      codice_destinatario: new FormControl(""),
      pec: new FormControl(""),
      gender: new FormControl(""),
      language: new FormControl(""),
      address: new FormGroup( {
        street_number: new FormControl(""),
        city: new FormControl(""),
        cap: new FormControl(""),
        country: new FormControl("")
      }),
    });
  }


  onSubmit() :void{
    this.submitted = true;
    let fullName = this.clientGroup.get("name").value.toString();
    if(!this.company){
      fullName += " ";
      fullName += this.clientGroup.get("lastname").value.toString();
    }

    const clientCreate: ClientCreate = {
      name: this.clientGroup.get("name").value,
      lastname: this.clientGroup.get("lastname").value,
      isCompany: this.clientGroup.get("isCompany").value,
      mail1: this.clientGroup.get("mail1").value,
      mail2:this.clientGroup.get("mail2").value,
      tel1: this.clientGroup.get("tel1").value,
      tel2: this.clientGroup.get("tel2").value,
      vat_number: this.clientGroup.get("vat_number").value,
      fiscal_code: this.clientGroup.get("fiscal_code").value,
      codice_destinatario: this.clientGroup.get("codice_destinatario").value,
      pec: this.clientGroup.get("pec").value,
      esigibilita_iva: "", //this.clientGroup.get("esigibilita_iva").value,
      publica_amministrazione: false, //this.clientGroup.get("publica_amministrazione").value,
      cup: "", //this.clientGroup.get("cup").value,
      cig: "", //this.clientGroup.get("cig").value,
      address: {
        name: fullName,
        street_number: this.clientGroup.get("address.street_number").value,
        city: this.clientGroup.get("address.city").value,
        cap: this.clientGroup.get("address.cap").value,
        country_code: this.clientGroup.get("address.country").value,
      },
      gender_code: this.clientGroup.get("gender").value,
      language_code: this.clientGroup.get("language").value,
    };

    if(this.createMode){
      this.api.createClientClientPost(clientCreate).subscribe((client) => {
        this.createUpdateSuccess(client);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    } else {
      this.api.updateClientClientClientIdPut(this.id, clientCreate).subscribe((client) => {
        this.createUpdateSuccess(client);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    }
  }

  createUpdateSuccess(client: Client): void{
    this.api.unlockClientClientUnlockClientIdPost(this.id).subscribe(() => {
      this.router.navigateByUrl("client/" + client.id.toString());
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  createUpdateError(error: any): void {
    console.log(error); //TODO: make error handling here
  }

  createUpdateComplete() : void {
    this.submitted = false;
  }

  companyCheckBoxClicked() :void {
    this.company = !this.company;
  }

  observableReady() :void {
    super.observableReady();
    if(!this.createMode){
      this.data$.pipe(tap(client => this.clientGroup.patchValue(client))).subscribe((client) => {
        this.company = client.isCompany;
        this.clientGroup.patchValue({
          language: client.language.code,
          gender: client.gender.code,
          address: {
            country: client.address.country.code
          }
        });
      }
      );
    }
  }


}
