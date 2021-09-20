import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {
    Contact,
    ContactUpdate,
    Credential,
    CredentialUpdate,
    DefaultService, Price, PriceUpdate,
    TechnicalData, TechnicalDataUpdate
} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-info-settings',
    templateUrl: './info-settings.component.html',
    styleUrls: ['./info-settings.component.scss']
})
export class InfoSettingsComponent implements OnInit {

    contactGroup: FormGroup;
    credentialGroup: FormGroup;
    priceGroup: FormGroup;
    technicalDataGroup: FormGroup;

    submitted = false;


    constructor(private api: DefaultService) {
    }

    ngOnInit(): void {
        this.initContacts();
        this.initCredentials();
        this.initPrices();
        this.initTechnicalData();
    }

    initContacts(): void {
        this.contactGroup = new FormGroup({
            contacts: new FormArray([]),
        });
        this.api.readContactsContactGet(0, 1000).pipe(first()).subscribe((contacts) => {
            this.addContactArrayToFormGroup(contacts);
        });
    }

    addContactArrayToFormGroup(contacts: Contact[]): void {
        for (const contact of contacts) {
            this.getContactFormArray().push(this.createContact(contact));
        }
    }

    createContact(contact?: Contact): FormGroup {
        if (contact === undefined) {
            return new FormGroup({
                name: new FormControl(''),
                tel: new FormControl(''),
                mail: new FormControl(''),
                note: new FormControl(''),
            });
        } else {
            return new FormGroup({
                name: new FormControl(contact.name),
                tel: new FormControl(contact.tel),
                mail: new FormControl(contact.mail),
                note: new FormControl(contact.note),
            });
        }
    }

    getContactFormArray(): FormArray {
        return this.contactGroup.get('contacts') as FormArray;
    }

    clearFormArray(formArray: FormArray): void {
        while (formArray.length > 0) {
            formArray.removeAt(0);
        }
    }

    updateContactsSuccess(contacts: Contact[]): void {
        this.submitted = false;
        console.log('InfoSettingsComponent: Update success');
    }

    removeContactAt(index: number): void {
        this.getContactFormArray().removeAt(index);
    }

    addNewContact(): void {
        this.getContactFormArray().push(this.createContact());
    }


    onSubmitContacts() {
        this.submitted = true;
        const contactUpdates: ContactUpdate[] = [];
        this.getContactFormArray().controls.forEach((contact) => {
            contactUpdates.push({
                name: contact.get('name').value,
                tel: contact.get('tel').value,
                mail: contact.get('mail').value,
                note: contact.get('note').value,
            });
        });
        this.api.bulkUpdateContactsContactBulkPut(contactUpdates).pipe(first()).subscribe({
                next: this.updateContactsSuccess.bind(this),
                error: this.updateError.bind(this),
                complete: this.updateComplete.bind(this)
        });
    }

    initCredentials(): void {
        this.credentialGroup = new FormGroup({
            credentials: new FormArray([]),
        });
        this.api.readCredentialsCredentialGet(0, 1000).pipe(first()).subscribe((credentials) => {
            this.addCredentialArrayToFormGroup(credentials);
        });
    }

    addCredentialArrayToFormGroup(credentials: Credential[]): void {
        for (const credential of credentials) {
            this.getCredentialFormArray().push(this.createCredential(credential));
        }
    }

    createCredential(credential?: Credential): FormGroup {
        if (credential === undefined) {
            return new FormGroup({
                name: new FormControl(''),
                url: new FormControl(''),
                username: new FormControl(''),
                password: new FormControl(''),
            });
        } else {
            return new FormGroup({
                name: new FormControl(credential.name),
                url: new FormControl(credential.url),
                username: new FormControl(credential.username),
                password: new FormControl(credential.password),
            });
        }
    }

    getCredentialFormArray(): FormArray {
        return this.credentialGroup.get('credentials') as FormArray;
    }

    updateCredentialsSuccess(credentials: Credential[]): void {
        console.log(this.getCredentialFormArray());
        this.clearFormArray(this.getCredentialFormArray());
        this.addCredentialArrayToFormGroup(credentials);
        this.submitted = false;
        console.log('InfoSettingsComponent: Update success');
    }

    removeCredentialAt(index: number): void {
        this.getCredentialFormArray().removeAt(index);
    }

    addNewCredential(): void {
        this.getCredentialFormArray().push(this.createCredential());
    }


    onSubmitCredentials() {
        this.submitted = true;
        const credentialUpdates: CredentialUpdate[] = [];
        this.getCredentialFormArray().controls.forEach((credential) => {
            credentialUpdates.push({
                name: credential.get('name').value,
                url: credential.get('url').value,
                username: credential.get('username').value,
                password: credential.get('password').value,
            });
        });
        this.api.bulkUpdateCredentialsCredentialBulkPut(credentialUpdates).pipe(first()).subscribe({
            next: this.updateCredentialsSuccess.bind(this),
            error: this.updateError.bind(this),
            complete: this.updateComplete.bind(this)
        });
    }

    initPrices(): void {
        this.priceGroup = new FormGroup({
            prices: new FormArray([]),
        });
        this.api.readPricesPriceGet(0, 1000).pipe(first()).subscribe((prices) => {
            this.addPriceArrayToFormGroup(prices);
        });
    }

    addPriceArrayToFormGroup(prices: Price[]): void {
        for (const price of prices) {
            this.getPriceFormArray().push(this.createPrice(price));
        }
    }

    createPrice(price?: Price): FormGroup {
        if (price === undefined) {
            return new FormGroup({
                name: new FormControl(''),
                price: new FormControl(''),
                comment: new FormControl(''),
            });
        } else {
            return new FormGroup({
                name: new FormControl(price.name),
                price: new FormControl(price.price),
                comment: new FormControl(price.comment),
            });
        }
    }

    getPriceFormArray(): FormArray {
        return this.priceGroup.get('prices') as FormArray;
    }

    updatePricesSuccess(prices: Price[]): void {
        console.log(this.getPriceFormArray());
        this.clearFormArray(this.getPriceFormArray());
        this.addPriceArrayToFormGroup(prices);
        this.submitted = false;
        console.log('InfoSettingsComponent: Update success');
    }

    removePriceAt(index: number): void {
        this.getPriceFormArray().removeAt(index);
    }

    addNewPrice(): void {
        this.getPriceFormArray().push(this.createPrice());
    }


    onSubmitPrices() {
        this.submitted = true;
        const priceUpdates: PriceUpdate[] = [];
        this.getPriceFormArray().controls.forEach((price) => {
            priceUpdates.push({
                name: price.get('name').value,
                price: price.get('price').value,
                comment: price.get('comment').value,
            });
        });
        this.api.bulkUpdatePricesPriceBulkPut(priceUpdates).pipe(first()).subscribe({
            next: this.updatePricesSuccess.bind(this),
            error: this.updateError.bind(this),
            complete: this.updateComplete.bind(this)
        });
    }

    initTechnicalData(): void {
        this.technicalDataGroup = new FormGroup({
            technicalData: new FormArray([]),
        });
        this.api.readTechnicalDatasTechnicalDataGet(0, 1000).pipe(first()).subscribe((technicalData) => {
            this.addTechnicalDataArrayToFormGroup(technicalData);
        });
    }

    addTechnicalDataArrayToFormGroup(technicalData: TechnicalData[]): void {
        for (const singleTechnicalData of technicalData) {
            this.getTechnicalDataFormArray().push(this.createTechnicalData(singleTechnicalData));
        }
    }

    createTechnicalData(technicalData?: TechnicalData): FormGroup {
        if (technicalData === undefined) {
            return new FormGroup({
                name: new FormControl(''),
                height: new FormControl(''),
                width: new FormControl(''),
                length: new FormControl(''),
            });
        } else {
            return new FormGroup({
                name: new FormControl(technicalData.name),
                height: new FormControl(technicalData.height),
                width: new FormControl(technicalData.width),
                length: new FormControl(technicalData.length),
            });
        }
    }

    getTechnicalDataFormArray(): FormArray {
        return this.technicalDataGroup.get('technicalData') as FormArray;
    }

    updateTechnicalDataSuccess(technicalData: TechnicalData[]): void {
        console.log(this.getTechnicalDataFormArray());
        this.clearFormArray(this.getTechnicalDataFormArray());
        this.addTechnicalDataArrayToFormGroup(technicalData);
        this.submitted = false;
        console.log('InfoSettingsComponent: Update success');
    }

    removeTechnicalDataAt(index: number): void {
        this.getTechnicalDataFormArray().removeAt(index);
    }

    addNewTechnicalData(): void {
        this.getTechnicalDataFormArray().push(this.createTechnicalData());
    }


    onSubmitTechnicalData() {
        this.submitted = true;
        const technicalDataUpdates: TechnicalDataUpdate[] = [];
        this.getTechnicalDataFormArray().controls.forEach((technicalData) => {
            technicalDataUpdates.push({
                name: technicalData.get('name').value,
                height: technicalData.get('height').value,
                width: technicalData.get('width').value,
                length: technicalData.get('length').value,
            });
        });
        this.api.bulkUpdateTechnicalDataTechnicalDataBulkPut(technicalDataUpdates).pipe(first()).subscribe({
            next: this.updateTechnicalDataSuccess.bind(this),
            error: this.updateError.bind(this),
            complete: this.updateComplete.bind(this)
        });
    }

    private updateError(error: any): void {
        console.error('InfoSettingsComponent: Could not update');
        console.error(error);
        this.submitted = false;
        // TODO: show snackbar here
    }

    private updateComplete(): void {
        this.submitted = false;
    }
}
