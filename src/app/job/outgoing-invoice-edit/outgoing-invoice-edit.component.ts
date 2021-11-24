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
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {first, tap} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {AuthService} from '../../shared/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as moment from 'moment';
import {formatDateTransport} from '../../shared/date.util';
import {FileService} from '../../shared/services/file.service';
import {CurrencyPipe, getLocaleCurrencyCode} from '@angular/common';

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
    title = 'Ausgangsrechnung: Bearbeiten';

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog, private currency: CurrencyPipe,
                private authService: AuthService, private snackBar: MatSnackBar, private file: FileService) {
        super(api, router, route, dialog);
    }

    calcTotalPrice(formGroup: FormGroup): void {
        const totalPrice = formGroup.get('single_price').value * formGroup.get('amount').value;
        formGroup.get('total_price').setValue(this.currency.transform(totalPrice, getLocaleCurrencyCode('de_DE')));
        this.recalculateInvoicePrice();
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> =>
        api.islockedOutgoingInvoiceOutgoingInvoiceIslockedOutgoingInvoiceIdGet(id);

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
                this.api.getParameterParameterKeyGet('invoice_number').pipe(first()).subscribe((invoiceNumberString) => {
                    this.invoiceGroup.get('number').setValue(invoiceNumberString);
                });
                this.addOtherInvoices();
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
                                if (this.createMode) {
                                    this.router.navigateByUrl(this.navigationTarget);
                                } else {
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
                            }
                        });
                    }
                });
            }
        });
        if (this.createMode) {
            this.title = 'Ausgangsrechnung: Erstellen';
        }
    }

    invoiceDeleteFailed(error?: any) {
        if (error) {
            console.error(error);
        }
        this.snackBar.open('Die Rechnung konnte leider nicht gelöscht werden.'
            , 'Ok', {
                duration: 10000
            });
        this.router.navigateByUrl(this.navigationTarget);
    }

    getDescriptiveArticles(): FormArray {
        return this.invoiceGroup.get('descriptive_articles') as FormArray;
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
                vat_id: 1
            };
            descriptiveArticles.push(descriptiveArticle);
        });


        if (this.createMode) {
            const invoiceCreate: OutgoingInvoiceCreate = {
                // eslint-disable-next-line id-blacklist
                number: this.invoiceGroup.get('number').value,
                date: formatDateTransport(this.invoiceGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_condition: this.invoiceGroup.get('payment_condition').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_date: formatDateTransport(this.invoiceGroup.get('payment_date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: this.invoiceGroup.get('vat_id').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.jobId,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: descriptiveArticles,
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
                date: formatDateTransport(this.invoiceGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_condition: this.invoiceGroup.get('payment_condition').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                payment_date: formatDateTransport(this.invoiceGroup.get('payment_date').value),
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
        this.api.getParameterParameterKeyGet('invoice_number').pipe(first()).subscribe((invoiceNumberString) => {
            const invoiceNumber = parseInt(invoiceNumberString, 10) + 1;
            this.api.setParameterParameterPost({
                key: 'invoice_number',
                value: invoiceNumber.toString()
            }).pipe(first()).subscribe(() => {
                this.file.open(invoice.pdf);
                this.router.navigateByUrl('job/' + this.jobId.toString(), {replaceUrl: true});
            });
        });
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
                this.recalculateInvoicePrice();
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

    private addDescriptiveArticle(name: string, amount: string, singlePrice: string, totalPrice: string): void {
        const descriptiveArticleFormGroup = new FormGroup({
            description: new FormControl(name),
            amount: new FormControl(amount),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            single_price: new FormControl(singlePrice),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            total_price: new FormControl(totalPrice)
        });
        this.getDescriptiveArticles().push(descriptiveArticleFormGroup);
    }

    private initOutgoingInvoiceGroup() {
        const now = new Date();
        const now30gg = new Date();
        now30gg.setDate(now.getDate() + 30);

        this.invoiceGroup = new FormGroup({
            date: new FormControl(now.toISOString()),
            // eslint-disable-next-line id-blacklist
            number: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_id: new FormControl(3),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_condition: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            payment_date: new FormControl(now30gg),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            descriptive_articles: new FormArray([
                this.initDescriptiveArticles()
            ]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            invoice_price: new FormControl(),
        });
        this.api.getParameterParameterKeyGet('invoice_number').pipe(first()).subscribe(invoiceNumberString => {
            this.invoiceGroup.get('number').setValue(invoiceNumberString);
        });
    }

    private recalculateInvoicePrice() {
        let invoicePrice = 0.0;
        this.getDescriptiveArticles().controls.forEach((descriptiveArticleControl) => {
            invoicePrice += parseFloat(descriptiveArticleControl.get('single_price').value) *
                parseFloat(descriptiveArticleControl.get('amount').value);
        });
        this.invoiceGroup.get('invoice_price').setValue(this.currency.transform(invoicePrice, getLocaleCurrencyCode('de_DE')));
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

    private addOtherInvoices() {
        this.api.readOutgoingInvoicesByJobOutgoingInvoiceJobJobIdGet(this.jobId).pipe(first()).subscribe((outgoingInvoices) => {
            for (const outgoingInvoice of outgoingInvoices) {
                this.addDescriptiveArticle(
                    'Abzüglich Rechnung Nr. ' + outgoingInvoice.number + ' vom '
                    + moment(outgoingInvoice.date, 'YYYY-MM-DD').format('DD.MM.YYYY'),
                    '1',
                    (outgoingInvoice.full_price_without_vat * (-1)).toString(),
                    (outgoingInvoice.full_price_without_vat * (-1)).toString(),
                );
            }
            //this.addDescriptiveArticleAt(this.getDescriptiveArticles().length - 1);
        });
    }
}
