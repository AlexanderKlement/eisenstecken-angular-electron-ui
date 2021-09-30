import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {
    DefaultService,
    Language,
    Lock,
    Supplier, SupplierCreate
} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'app-supplier-edit',
    templateUrl: './supplier-edit.component.html',
    styleUrls: ['./supplier-edit.component.scss']
})
export class SupplierEditComponent extends BaseEditComponent<Supplier> implements OnInit, OnDestroy {

    supplierGroup: FormGroup;

    navigationTarget = 'supplier';
    languageOptions$: Observable<Language[]>;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedSupplierSupplierIslockedSupplierIdGet(id);
    dataFunction = (api: DefaultService, id: number): Observable<Supplier> => api.readSupplierSupplierSupplierIdGet(id);
    unlockFunction = (afterUnlockFunction: VoidFunction = () => {
    }): void => {
        this.api.unlockSupplierSupplierUnlockSupplierIdPost(this.id).subscribe(() => {
            afterUnlockFunction();
        });
    };

    ngOnInit(): void {
        super.ngOnInit();
        this.initSupplierGroup();
        this.languageOptions$ = this.api.readLanguagesLanguageGet();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    onSubmit(): void {
        this.submitted = true;

        const supplierCreate: SupplierCreate = {
            name: this.supplierGroup.get('name').value,
            mail1: this.supplierGroup.get('mail1').value,
            mail2: this.supplierGroup.get('mail2').value,
            tel1: this.supplierGroup.get('tel1').value,
            tel2: this.supplierGroup.get('tel2').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            contact_person: this.supplierGroup.get('contact_person').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            destination_code: this.supplierGroup.get('destination_code').value,
            address: {
                name: this.supplierGroup.get('name').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: this.supplierGroup.get('address.street_number').value,
                city: this.supplierGroup.get('address.city').value,
                cap: this.supplierGroup.get('address.cap').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                country_code: this.supplierGroup.get('address.country').value,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            language_code: this.supplierGroup.get('language').value,
        };

        if (this.createMode) {
            this.api.createSupplierSupplierPost(supplierCreate).subscribe((supplier) => {
                this.createUpdateSuccess(supplier);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        } else {
            this.api.updateSupplierSupplierSupplierIdPut(this.id, supplierCreate).subscribe((supplier) => {
                this.createUpdateSuccess(supplier);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        }
    }

    createUpdateSuccess(supplier: Supplier): void {
        this.id = supplier.id;
        this.unlockFunction(() => {
            this.router.navigateByUrl('supplier/' + supplier.id.toString());
        });
    }

    getAddressGroup(): FormGroup {
        return this.supplierGroup.get('address') as FormGroup;
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
            this.data$.pipe(tap(client => this.supplierGroup.patchValue(client))).subscribe((client) => {
                    this.supplierGroup.patchValue({
                        language: client.language.code,
                        name: client.name,
                        address: {
                            country: client.address.country.code
                        }
                    });
                }
            );
        }
    }


    private initSupplierGroup() {
        this.supplierGroup = new FormGroup({
            name: new FormControl(''),
            mail1: new FormControl(''),
            mail2: new FormControl(''),
            tel1: new FormControl(''),
            tel2: new FormControl(''),
            language: new FormControl('DE'),
            contact_person: new FormControl(''),
            destination_code: new FormControl(''),
            address: new FormGroup({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                street_number: new FormControl(''),
                city: new FormControl(''),
                cap: new FormControl(''),
                country: new FormControl('DE')
            }),
        });
    }


}
