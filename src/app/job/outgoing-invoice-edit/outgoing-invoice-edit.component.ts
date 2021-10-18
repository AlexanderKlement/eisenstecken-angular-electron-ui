import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    DefaultService,
    DescriptiveArticle,
    DescriptiveArticleCreate,
    Lock,
    OutgoingInvoice,
    OutgoingInvoiceCreate,
    OutgoingInvoiceUpdate,
    Vat
} from 'eisenstecken-openapi-angular-library';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {first, tap} from 'rxjs/operators';
import {formatDate} from '@angular/common';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {AuthService} from '../../shared/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-outgoing-invoice-edit',
    templateUrl: './outgoing-invoice-edit.component.html',
    styleUrls: ['./outgoing-invoice-edit.component.scss']
})
export class OutgoingInvoiceEditComponent extends BaseEditComponent<OutgoingInvoice> implements OnInit, OnDestroy {

    invoiceGroup: FormGroup;
    submitted = false;
    vatOptions$: Observable<Vat[]>;
    jobId: number;
    navigationTarget = 'job';
    hiddenDescriptives: number[];
    buttons: CustomButton[] = [];

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog,
                private authService: AuthService, private snackBar: MatSnackBar) {
        super(api, router, route, dialog);
    }

    public static formatDateTransport(datetime: string): string { //TODO: move to some sort of util class or so
        return formatDate(datetime, 'yyyy-MM-dd', 'en-US');
    }

    calcTotalPrice(formGroup: FormGroup): void {
        const totalPrice = formGroup.get('single_price').value * formGroup.get('amount').value;
        formGroup.get('total_price').setValue(totalPrice);
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> =>
        api.islockedOutgoingInvoiceOutgoingInvoiceIslockedOutgoingInvoiceIdGet(id) //TODO: correct this after next update
    ;

    dataFunction = (api: DefaultService, id: number): Observable<OutgoingInvoice> =>
        api.readOutgoingInvoiceOutgoingInvoiceOutgoingInvoiceIdGet(id);

    unlockFunction = (api: DefaultService, id: number): Observable<boolean> =>
        api.unlockOutgoingInvoiceOutgoingInvoiceUnlockOutgoingInvoiceIdPost(id);

    ngOnInit(): void {
        this.hiddenDescriptives = [];
        super.ngOnInit();
        this.vatOptions$ = this.api.readVatsVatGet();
        this.initOutgoingInvoiceGroup();
        if (this.createMode) {
            this.routeParams.subscribe((params) => {
                this.jobId = parseInt(params.job_id, 10);
                if (isNaN(this.jobId)) {
                    console.error('OutgoingInvoiceEdit: Cannot determine job id');
                    this.router.navigateByUrl(this.navigationTarget);
                }
                this.navigationTarget = 'job/' + this.jobId.toString();
                this.api.readJobJobJobIdGet(this.jobId).pipe(first()).subscribe((job) => {
                    this.fillRightSidebar(job.client.language.code);
                });
            });
        }
        this.authService.currentUserHasRight('outgoing_invoices:delete').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Rechnung löschen',
                    navigate: (): void => {
                        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                            width: '400px',
                            data: {
                                title: 'Rechnung löschen?',
                                text: 'Dieser Schritt kann nicht rückgängig gemacht werden.'
                            }
                        });
                        dialogRef.afterClosed().subscribe(result => {
                            if (result) {
                                this.api.deleteOutgoingInvoiceOutgoingInvoiceOutgoingInvoiceIdDelete(this.id)
                                    .pipe(first()).subscribe((success) => {
                                        if (success) {
                                            this.router.navigateByUrl(this.navigationTarget);
                                        } else {
                                            this.invoiceDeleteFailed();
                                        }
                                    },
                                    error => {
                                        this.invoiceDeleteFailed(error);
                                    });
                            }
                        });
                    }
                });
            }
        });
    }

    invoiceDeleteFailed(error?: any) {
        if (error) {
            console.error(error);
        }
        this.snackBar.open('Die Rechnung konnte leider nicht gelöscht werden.'
            , 'Ok',{
            duration: 10000
          });
        this.router.navigateByUrl(this.navigationTarget);
    }

    getDescriptiveArticles(): FormArray {
        return this.invoiceGroup.get('descriptive_articles') as FormArray;
    }

    getSubDescriptiveArticles(formGroup: AbstractControl): FormArray {
        return formGroup.get('sub_descriptive_articles') as FormArray;
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

    addDescriptiveArticleAt(index: number): void {
        this.getDescriptiveArticles().insert(index + 1, this.initDescriptiveArticles());
    }

    toggleCollapseDescriptiveArticle(index: number | undefined): void {
        if (index === -1) {
            const control = this.getDescriptiveArticles().controls;
            if (control.length === this.hiddenDescriptives.length) {
                this.hiddenDescriptives = [];
                return;
            }

            this.hiddenDescriptives = [];
            control.forEach((_, idx) => {
                this.hiddenDescriptives.push(idx);
            });
            return;
        }
        const oldLength = this.hiddenDescriptives.length;
        this.hiddenDescriptives = this.hiddenDescriptives.filter((idx) => idx !== index);
        if (oldLength === this.hiddenDescriptives.length) {
            this.hiddenDescriptives.push(index);
        }
    }

    isHidden(index: number | undefined): boolean {
        if (index === -1) {
            return this.getDescriptiveArticles().controls.length === this.hiddenDescriptives.length;
        }
        return this.hiddenDescriptives.filter(idx => idx === index).length !== 0;
    }

    moveDescriptiveArticleUp(index: number): void {
        const descriptiveArticle = this.getDescriptiveArticles().at(index);
        this.getDescriptiveArticles().removeAt(index);
        this.getDescriptiveArticles().insert(index - 1, descriptiveArticle);
    }

    moveDescriptiveArticleDown(index: number): void {
        const descriptiveArticle = this.getDescriptiveArticles().at(index);
        this.getDescriptiveArticles().removeAt(index);
        this.getDescriptiveArticles().insert(index + 1, descriptiveArticle);
    }

    onSubmit(): void {
        this.submitted = true;
        const descriptiveArticles = [];
        this.getDescriptiveArticles().controls.forEach((descriptiveArticleControl) => {
            const descriptiveArticle: DescriptiveArticleCreate = {
                name: '',
                amount: descriptiveArticleControl.get('amount').value,
                description: descriptiveArticleControl.get('description').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: descriptiveArticleControl.get('single_price').value,
                discount: 0,
                alternative: false,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: [],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: 1,
            };
            descriptiveArticles.push(descriptiveArticle);
        });


        if (this.createMode) {
            const invoiceCreate: OutgoingInvoiceCreate = {
                // eslint-disable-next-line id-blacklist
                number: this.invoiceGroup.get('number').value,
                date: OutgoingInvoiceEditComponent.formatDateTransport(this.invoiceGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_condition: this.invoiceGroup.get('payment_condition').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_date: OutgoingInvoiceEditComponent.formatDateTransport(this.invoiceGroup.get('payment_date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: this.invoiceGroup.get('vat_id').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.jobId,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: descriptiveArticles
            };
            this.api.createOutgoingInvoiceOutgoingInvoicePost(invoiceCreate).pipe(first()).subscribe((invoice) => {
                this.createUpdateSuccess(invoice);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        } else {
            const invoiceUpdate: OutgoingInvoiceUpdate = {
                // eslint-disable-next-line id-blacklist
                number: this.invoiceGroup.get('number').value,
                date: OutgoingInvoiceEditComponent.formatDateTransport(this.invoiceGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_condition: this.invoiceGroup.get('payment_condition').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_date: OutgoingInvoiceEditComponent.formatDateTransport(this.invoiceGroup.get('payment_date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: this.invoiceGroup.get('vat_id').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: descriptiveArticles
            };
            this.api.updateOutgoingInvoiceOutgoingInvoiceOutgoingInvoiceIdPut(this.id, invoiceUpdate).pipe(first()).subscribe((invoice) => {
                this.createUpdateSuccess(invoice);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        }
    }

    createUpdateSuccess(invoice: OutgoingInvoice): void {
        this.id = invoice.id;
        this.router.navigateByUrl('job/' + this.jobId.toString()); //TODO: change this to the detail view of the offer
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
            this.data$.pipe(tap(invoice => this.invoiceGroup.patchValue(invoice))).subscribe((invoice) => {
                this.getDescriptiveArticles().removeAt(0);
                invoice.descriptive_articles.forEach((descriptiveArticle) => {
                    this.getDescriptiveArticles().push(this.initDescriptiveArticles(descriptiveArticle));
                });
                this.invoiceGroup.patchValue({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    vat_id: invoice.vat.id
                });
                this.jobId = invoice.job_id;
            });

        }
    }

    protected initDescriptiveArticles(descriptiveArticle?: DescriptiveArticle): FormGroup {
        const descriptiveArticleFormGroup = new FormGroup({
            description: new FormControl(''),
            amount: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            single_price: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            total_price: new FormControl('')
        });

        this.subscription.add(descriptiveArticleFormGroup.get('single_price').valueChanges.subscribe(
            () => {
                this.calcTotalPrice(descriptiveArticleFormGroup);
            }));
        this.subscription.add(descriptiveArticleFormGroup.get('amount').valueChanges.subscribe(
            () => {
                this.calcTotalPrice(descriptiveArticleFormGroup);
            }));

        if (descriptiveArticle !== undefined) {
            descriptiveArticleFormGroup.patchValue({
                description: descriptiveArticle.description,
                amount: descriptiveArticle.amount,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: descriptiveArticle.single_price,
            });
        }

        return descriptiveArticleFormGroup;
    }

    private initOutgoingInvoiceGroup() {
        const now = new Date();
        const now30gg = new Date();
        now30gg.setDate(now.getDate() + 30);
        this.invoiceGroup = new FormGroup({
            date: new FormControl(now.toISOString()),
            // eslint-disable-next-line id-blacklist
            number: new FormControl(''), // TODO: init the next logical number here
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_id: new FormControl(2),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_condition: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_date: new FormControl(now30gg),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            descriptive_articles: new FormArray([
                this.initDescriptiveArticles()
            ]),
        });
    }

    private fillRightSidebar(langCode: string): void {
        const langCodeLower = langCode.toLowerCase();
        this.getAndFillParameters('payment_condition', 'invoice_payment_condition_' + langCodeLower);
    }

    private getAndFillParameters(formControlName: string, key: string) {
        this.api.getParameterParameterKeyGet(key).pipe(first()).subscribe((parameter) => {
            this.invoiceGroup.patchValue({
                [formControlName]: parameter,
            });
        });
    }
}
