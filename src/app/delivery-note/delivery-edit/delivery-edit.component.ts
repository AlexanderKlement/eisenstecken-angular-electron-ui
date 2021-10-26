import {Component, OnInit} from '@angular/core';
import {
    DefaultService,
    DeliveryNote, DeliveryNoteCreate, DeliveryNoteReason, DeliveryNoteUpdate,
    DescriptiveArticle,
    DescriptiveArticleCreate,
    Lock
} from 'eisenstecken-openapi-angular-library';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {OutgoingInvoiceEditComponent} from '../../job/outgoing-invoice-edit/outgoing-invoice-edit.component';
import {AuthService} from '../../shared/auth.service';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {MatSnackBar} from '@angular/material/snack-bar';


export interface JobMinimal {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    displayable_name: string;
    id: number;
}

@Component({
    selector: 'app-delivery-edit',
    templateUrl: './delivery-edit.component.html',
    styleUrls: ['./delivery-edit.component.scss']
})
export class DeliveryEditComponent extends BaseEditComponent<DeliveryNote> implements OnInit {
    deliveryNoteGroup: FormGroup;
    submitted = false;
    navigationTarget = 'delivery_note';
    essentialJobList: Observable<JobMinimal[]>;
    deliveryNoteReasons: Observable<DeliveryNoteReason[]>;
    buttons: CustomButton[] = [];

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog,
                private authService: AuthService, private snackBar: MatSnackBar) {
        super(api, router, route, dialog);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> =>
        api.islockedDeliveryNoteDeliveryNoteIslockedDeliveryNoteIdGet(id);

    dataFunction = (api: DefaultService, id: number): Observable<DeliveryNote> =>
        api.readDeliveryNoteDeliveryNoteDeliveryNoteIdGet(id);

    unlockFunction = (api: DefaultService, id: number): Observable<boolean> =>
        api.unlockDeliveryNoteDeliveryNoteUnlockDeliveryNoteIdPost(id);


    ngOnInit(): void {
        super.ngOnInit();
        this.initDeliveryNoteGroup();
        this.essentialJobList = this.api.readJobsJobGet(0, 100, '', undefined, 'JOBSTATUS_ACCEPTED', true).pipe(map(
            jobs => {
                const minimalJobs: JobMinimal[] = jobs;
                minimalJobs.splice(0, 0, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    displayable_name: 'Selbst eintragen',
                    id: 0,
                });
                return minimalJobs;
            }
        ));
        this.deliveryNoteReasons = this.api.readDeliveryNoteReasonsDeliveryNoteReasonsGet();
        if (this.createMode) {
            this.api.getNextDeliveryNoteNumberDeliveryNoteNumberGet().pipe(first()).subscribe(deliveryNoteNumber => {
                this.deliveryNoteGroup.get('delivery_note_number').setValue(deliveryNoteNumber);
            });
            this.addDescriptiveArticleAt(0);
        } else {
            this.authService.currentUserHasRight('delivery_notes:delete').pipe(first()).subscribe(allowed => {
                if (allowed) {
                    this.buttons.push({
                        name: 'Lieferschein löschen',
                        navigate: () => {
                            this.deliveryNoteDeleteClicked();
                        }
                    });
                }
            });
        }
    }

    onSubmit() {
        this.submitted = true;
        const descriptiveArticles: DescriptiveArticleCreate[] = [];
        for (const article of this.getDescriptiveArticles().controls) {
            descriptiveArticles.push({
                name: article.get('description').value,
                amount: parseFloat(article.get('amount').value),
                description: article.get('description').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: 0.0,
                discount: 0,
                alternative: false,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: 1
            });
        }
        if (this.createMode) {
            const deliveryNoteCreate: DeliveryNoteCreate = {
                // eslint-disable-next-line id-blacklist
                number: this.deliveryNoteGroup.get('delivery_note_number').value,
                date: OutgoingInvoiceEditComponent.formatDateTransport(this.deliveryNoteGroup.get('date').value),
                name: this.deliveryNoteGroup.get('name').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                delivery_address: this.deliveryNoteGroup.get('delivery_address').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                company_address: this.deliveryNoteGroup.get('company_address').value,
                variations: this.deliveryNoteGroup.get('variations').value,
                weight: this.deliveryNoteGroup.get('weight').value,
                freight: this.deliveryNoteGroup.get('freight').value,
                free: this.deliveryNoteGroup.get('free').value,
                assigned: this.deliveryNoteGroup.get('assigned').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.deliveryNoteGroup.get('job_id').value,
                articles: descriptiveArticles,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                delivery_note_reason_id: this.deliveryNoteGroup.get('delivery_note_reason_id').value,
            };
            this.api.createDeliveryNoteDeliveryNotePost(deliveryNoteCreate).pipe(first()).subscribe(deliveryNote => {
                this.submitted = false;
                this.router.navigateByUrl('delivery_note');
            }, this.createUpdateError);
        } else {
            const deliveryNoteUpdate: DeliveryNoteUpdate = {
                // eslint-disable-next-line id-blacklist
                number: this.deliveryNoteGroup.get('delivery_note_number').value,
                date: OutgoingInvoiceEditComponent.formatDateTransport(this.deliveryNoteGroup.get('date').value),
                name: this.deliveryNoteGroup.get('name').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                delivery_address: this.deliveryNoteGroup.get('delivery_address').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                company_address: this.deliveryNoteGroup.get('company_address').value,
                variations: this.deliveryNoteGroup.get('variations').value,
                weight: this.deliveryNoteGroup.get('weight').value,
                freight: this.deliveryNoteGroup.get('freight').value,
                free: this.deliveryNoteGroup.get('free').value,
                assigned: this.deliveryNoteGroup.get('assigned').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.deliveryNoteGroup.get('job_id').value,
                articles: descriptiveArticles,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                delivery_note_reason_id: this.deliveryNoteGroup.get('delivery_note_reason_id').value,
            };
            this.api.updateDeliveryNoteDeliveryNoteDeliveryNoteIdPut(this.id, deliveryNoteUpdate).pipe(first()).subscribe(deliveryNote => {
                this.submitted = false;
                this.router.navigateByUrl('delivery_note');
            }, this.createUpdateError);
        }
    }

    addDescriptiveArticleAt(index: number) {
        this.getDescriptiveArticles().insert(index + 1, this.initDescriptiveArticles());
    }

    moveDescriptiveArticleUp(index: number) {
        const descriptiveArticle = this.getDescriptiveArticles().at(index);
        this.getDescriptiveArticles().removeAt(index);
        this.getDescriptiveArticles().insert(index - 1, descriptiveArticle);
    }

    moveDescriptiveArticleDown(index: number) {
        const descriptiveArticle = this.getDescriptiveArticles().at(index);
        this.getDescriptiveArticles().removeAt(index);
        this.getDescriptiveArticles().insert(index + 1, descriptiveArticle);
    }

    getDescriptiveArticles(): FormArray {
        return this.deliveryNoteGroup.get('articles') as FormArray;
    }

    removeDescriptiveArticle(index: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Position löschen?',
                text: 'Dieser Schritt kann nicht rückgängig gemacht werden.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getDescriptiveArticles().removeAt(index);
            }
        });
    }

    selectedJobChanged() {
        const jobId = this.deliveryNoteGroup.get('job_id').value;
        if (jobId === 0) {
            this.deliveryNoteGroup.get('name').setValue('');
            this.deliveryNoteGroup.get('company_address').setValue('');
            this.deliveryNoteGroup.get('delivery_address').setValue('');
        } else {
            this.api.readJobJobJobIdGet(jobId).pipe(first()).subscribe(job => {
                this.deliveryNoteGroup.get('name').setValue(job.client.fullname);
                const address = job.client.address.address_1 + ' ' + job.client.address.address_2;
                this.deliveryNoteGroup.get('company_address').setValue(address);
                this.deliveryNoteGroup.get('delivery_address').setValue(address);
            });
        }
    }

    protected observableReady() {
        super.observableReady();
        this.data$.pipe(first()).subscribe(deliveryNote => {
            this.deliveryNoteGroup.patchValue(deliveryNote);
            this.deliveryNoteGroup.get('delivery_note_number').setValue(deliveryNote.number);
            for (const article of deliveryNote.articles) {
                this.getDescriptiveArticles().push(this.initDescriptiveArticles(article));
            }
            if (this.getDescriptiveArticles().controls.length === 0) {
                this.getDescriptiveArticles().push(this.initDescriptiveArticles());
            }
            this.deliveryNoteGroup.get('delivery_note_reason_id').setValue(deliveryNote.delivery_note_reason.id);
        });
    }

    protected initDescriptiveArticles(descriptiveArticle?: DescriptiveArticle): FormGroup {
        if (descriptiveArticle === undefined) {
            return new FormGroup({
                description: new FormControl('', Validators.required),
                amount: new FormControl('', Validators.required)
            });
        } else {
            return new FormGroup({
                description: new FormControl(descriptiveArticle.description, Validators.required),
                amount: new FormControl(descriptiveArticle.amount, Validators.required)
            });
        }
    }


    private initDeliveryNoteGroup(): void {
        const now = new Date();
        this.deliveryNoteGroup = new FormGroup({
            date: new FormControl(now.toISOString()),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            delivery_note_number: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            name: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            company_address: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            delivery_address: new FormControl(''),
            variations: new FormControl(''),
            articles: new FormArray([]),
            weight: new FormControl(''),
            freight: new FormControl(false),
            free: new FormControl(false),
            assigned: new FormControl(false),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_id: new FormControl(0),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            delivery_note_reason_id: new FormControl(1)
        });
    }

    private deliveryNoteDeleteClicked() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Lieferschein löschen?',
                text: 'Den Lieferschein löschen? Diese Aktion kann NICHT rückgängig gemacht werden!'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.api.deleteDeliveryNoteDeliveryNoteDeliveryNoteIdDelete(this.id).pipe(first()).subscribe(success => {
                    if (success) {
                        this.router.navigateByUrl('delivery_docket');
                    } else {
                        this.snackBar.open('Lieferschein konnte nicht gelöscht werden', 'Ok', {
                            duration: 10000
                        });
                    }
                });

            }
        });
    }
}
