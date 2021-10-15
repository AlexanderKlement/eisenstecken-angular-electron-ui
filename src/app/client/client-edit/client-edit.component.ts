import {Component, OnDestroy, OnInit} from '@angular/core';
import {DefaultService, Client, Lock, Gender, Language, ClientCreate} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {first, tap} from 'rxjs/operators';

@Component({
    selector: 'app-client-edit',
    templateUrl: './client-edit.component.html',
    styleUrls: ['./client-edit.component.scss']
})
export class ClientEditComponent extends BaseEditComponent<Client> implements OnInit, OnDestroy {

    navigationTarget = '/client';
    clientGroup: FormGroup;
    company = false;
    genderOptions$: Observable<Gender[]>;
    languageOptions$: Observable<Language[]>;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedClientClientIslockedClientIdGet(id);

    dataFunction = (api: DefaultService, id: number): Observable<Client> => api.readClientClientClientIdGet(id);
    unlockFunction = (api: DefaultService, id: number): Observable<boolean> => api.unlockClientClientUnlockClientIdPost(id);

    ngOnInit(): void {
        super.ngOnInit();
        this.clientGroup = new FormGroup({
            name: new FormControl(''),
            lastname: new FormControl(''),
            isCompany: new FormControl(''),
            mail1: new FormControl(''),
            mail2: new FormControl(''),
            tel1: new FormControl(''),
            tel2: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_number: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            fiscal_code: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            codice_destinatario: new FormControl(''),
            pec: new FormControl(''),
            gender: new FormControl('M'),
            language: new FormControl('DE'),
            address: new FormGroup({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: new FormControl(''),
                city: new FormControl(''),
                cap: new FormControl(''),
                country: new FormControl('DE')
            }),
        });
        this.genderOptions$ = this.api.readGendersGenderGet();
        this.languageOptions$ = this.api.readLanguagesLanguageGet();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }


    onSubmit(): void {
        this.submitted = true;
        let fullName = this.clientGroup.get('name').value.toString();
        if (!this.company) {
            fullName += ' ';
            fullName += this.clientGroup.get('lastname').value.toString();
        }

        const clientCreate: ClientCreate = {
            name: this.clientGroup.get('name').value,
            lastname: this.clientGroup.get('lastname').value,
            isCompany: this.company,
            mail1: this.clientGroup.get('mail1').value,
            mail2: this.clientGroup.get('mail2').value,
            tel1: this.clientGroup.get('tel1').value,
            tel2: this.clientGroup.get('tel2').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_number: this.clientGroup.get('vat_number').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            fiscal_code: this.clientGroup.get('fiscal_code').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            codice_destinatario: this.clientGroup.get('codice_destinatario').value,
            pec: this.clientGroup.get('pec').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            esigibilita_iva: '', //this.clientGroup.get("esigibilita_iva").value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            publica_amministrazione: false, //this.clientGroup.get("publica_amministrazione").value,
            cup: '', //this.clientGroup.get("cup").value,
            cig: '', //this.clientGroup.get("cig").value,
            address: {
                name: fullName,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: this.clientGroup.get('address.street_number').value,
                city: this.clientGroup.get('address.city').value,
                cap: this.clientGroup.get('address.cap').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                country_code: this.clientGroup.get('address.country').value,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            gender_code: this.clientGroup.get('gender').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            language_code: this.clientGroup.get('language').value,
        };

        if (this.createMode) {
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

    createUpdateSuccess(client: Client): void {
        this.id = client.id;
        this.router.navigateByUrl('client/' + this.id.toString());
    }

    companyCheckBoxClicked(): void {
        this.company = !this.company;
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
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

    getAddressGroup(): FormGroup {
        return this.clientGroup.get('address') as FormGroup;
    }
}
