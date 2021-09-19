import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {lstat} from 'fs';
import {Contact, ContactUpdate, DefaultService} from 'eisenstecken-openapi-angular-library';
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
    }

    initContacts(): void {
        this.contactGroup = new FormGroup({
            contacts: new FormArray([]),
        });
        this.api.readContactsContactGet(0, 1000).pipe(first()).subscribe((contacts) => {
            for (const contact of contacts) {
                this.getContactFormArray().push(this.addContact(contact));
            }
        });
    }

    addContact(contact?: Contact): FormGroup {
        if (contact === undefined) {
            return new FormGroup({
                id: new FormControl(-1),
                name: new FormControl(''),
                tel: new FormControl(''),
                mail: new FormControl(''),
                note: new FormControl(''),
            });
        } else {
            return new FormGroup({
                id: new FormControl(contact.id),
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


    onSubmitContacts() {
        this.submitted = true;
        const contactUpdates: ContactUpdate[] = [];
        this.getContactFormArray().controls.forEach((contact) => {
            contactUpdates.push({
                name: contact.get('name').value,
                tel: contact.get('tel').value,
                mail: contact.get('mail').value,
                note: contact.get('note').value,
                id: contact.get('id').value,
            });
        });
        this.api.bulkUpdateContactsContactBulkPut(contactUpdates).pipe(first()).subscribe((contacts) => {
            console.log(contacts);
        });
    }
}
