import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {BaseEditComponent} from '../../shared/components/base-edit/base-edit.component';
import {
    DefaultService,
    OfferCreate,
    OfferUpdate,
    Lock,
    Offer,
    DescriptiveArticleCreate, Vat, DescriptiveArticle
} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {Observable, Subscription} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {FileService} from '../../shared/services/file.service';
import {formatDateTransport} from '../../shared/date.util';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {CurrencyPipe, getLocaleCurrencyCode} from '@angular/common';

@Component({
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.component.html',
    styleUrls: ['./offer-edit.component.scss']
})
export class OfferEditComponent extends BaseEditComponent<Offer> implements OnInit, OnDestroy {

    navigationTarget = 'job';
    jobId: number;
    offerGroup: FormGroup;
    submitted: boolean;
    vatOptions$: Observable<Vat[]>;
    hiddenDescriptives: number[];
    title = 'Angebot: Bearbeiten';
    buttons: CustomButton[] = [];
    subscription: Subscription;

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog,
                private file: FileService, private currency: CurrencyPipe) {
        super(api, router, route, dialog);
    }

    get discountAmount(): FormControl {
        return this.offerGroup.get('discount_amount') as FormControl;
    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedOfferOfferIslockedOfferIdGet(id);

    dataFunction = (api: DefaultService, id: number): Observable<Offer> => api.readOfferOfferOfferIdGet(id);

    unlockFunction = (api: DefaultService, id: number): Observable<boolean> => api.lockOfferOfferUnlockOfferIdPost(id);

    ngOnInit(): void {
        super.ngOnInit();
        this.subscription = new Subscription();
        this.vatOptions$ = this.api.readVatsVatGet();
        this.hiddenDescriptives = [];
        this.initOfferGroup();
        if (this.createMode) {
            this.routeParams.subscribe((params) => {
                this.jobId = parseInt(params.job_id, 10);
                if (isNaN(this.jobId)) {
                    console.error('OfferEdit: Cannot determine job id');
                    this.router.navigateByUrl(this.navigationTarget);
                }
                this.navigationTarget = 'job/' + this.jobId.toString();
                this.api.readJobJobJobIdGet(this.jobId).pipe(first()).subscribe((job) => {
                    this.fillRightSidebar(job.client.language.code);
                });
            });
        }
        if (this.createMode) {
            this.title = 'Angebot: Erstellen';
        }

        this.buttons.push({
            name: 'Angebot löschen',
            navigate: (): void => {
                this.onOfferDeleteClicked();
            }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.subscription.unsubscribe();
    }

    onSubmit(): void {
        this.submitted = true;
        const descriptiveArticles = [];
        this.getDescriptiveArticles().controls.forEach((descriptiveArticleControl) => {
            const subDescriptiveArticleArray: DescriptiveArticleCreate[] = [];
            this.getSubDescriptiveArticles(descriptiveArticleControl).controls.forEach((subDescriptiveArticleControl) => {
                const subDescriptiveArticle: DescriptiveArticleCreate = {
                    name: '',
                    amount: subDescriptiveArticleControl.get('amount').value,
                    description: subDescriptiveArticleControl.get('description').value,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    single_price: subDescriptiveArticleControl.get('single_price').value,
                    discount: 0,
                    alternative: subDescriptiveArticleControl.get('alternative').value,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    vat_id: 1,
                };
                subDescriptiveArticleArray.push(subDescriptiveArticle);
            });
            const descriptiveArticle: DescriptiveArticleCreate = {
                name: '',
                amount: 0,
                description: descriptiveArticleControl.get('description').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: 0,
                discount: 0,
                alternative: false,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: subDescriptiveArticleArray,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: 1,
            };
            descriptiveArticles.push(descriptiveArticle);
        });


        if (this.createMode) {
            const offerCreate: OfferCreate = {
                date: formatDateTransport(this.offerGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                in_price_included: this.offerGroup.get('in_price_included').value,
                validity: this.offerGroup.get('validity').value,
                payment: this.offerGroup.get('payment').value,
                delivery: this.offerGroup.get('delivery').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.jobId,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: this.offerGroup.get('vat_id').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: descriptiveArticles,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                discount_amount: this.offerGroup.get('discount_amount').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                material_description: this.offerGroup.get('material_description').value
            };
            this.api.createOfferOfferPost(offerCreate).pipe(first()).subscribe((offer) => {
                this.createUpdateSuccess(offer);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        } else {
            const offerUpdate: OfferUpdate = {
                date: formatDateTransport(this.offerGroup.get('date').value),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                in_price_included: this.offerGroup.get('in_price_included').value,
                validity: this.offerGroup.get('validity').value,
                payment: this.offerGroup.get('payment').value,
                delivery: this.offerGroup.get('delivery').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                descriptive_articles: descriptiveArticles,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                vat_id: this.offerGroup.get('vat_id').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                discount_amount: this.offerGroup.get('discount_amount').value,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                material_description: this.offerGroup.get('material_description').value
            };
            this.api.updateOfferOfferOfferIdPut(this.id, offerUpdate).subscribe((offer) => {
                this.createUpdateSuccess(offer);
            }, (error) => {
                this.createUpdateError(error);
            }, () => {
                this.createUpdateComplete();
            });
        }
    }

    createUpdateSuccess(offer: Offer): void {
        this.id = offer.id;
        this.file.open(offer.pdf);
        this.router.navigateByUrl('job/' + this.jobId.toString(), {replaceUrl: true});
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
            this.data$.pipe(tap(offer => this.offerGroup.patchValue(offer))).subscribe((offer) => {
                this.getDescriptiveArticles().removeAt(0);
                offer.descriptive_articles.forEach((descriptiveArticle) => {
                    this.getDescriptiveArticles().push(this.initDescriptiveArticles(descriptiveArticle));
                });
                this.offerGroup.patchValue({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    in_price_included: offer.in_price_included,
                    validity: offer.validity,
                    payment: offer.payment,
                    delivery: offer.delivery,
                    //date: offer.date, //remove this line if always today's date should be shown -> and vice versa
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    discount_amount: offer.discount_amount,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    material_description: offer.material_description
                });
                this.jobId = offer.job_id;
                this.recalculateOfferPrice();
            });

        }
    }

    getDescriptiveArticles(): FormArray {
        return this.offerGroup.get('descriptive_articles') as FormArray;
    }

    getSubDescriptiveArticles(formGroup: AbstractControl): FormArray {
        return formGroup.get('sub_descriptive_articles') as FormArray;
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

    removeDescriptiveSubArticle(descriptiveArticleControl: AbstractControl, j: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Position löschen?',
                text: 'Dieser Schritt kann nicht rückgängig gemacht werden.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getSubDescriptiveArticles(descriptiveArticleControl).removeAt(j);
            }
        });

    }

    addDescriptiveSubArticle(descriptiveArticleControl: AbstractControl, j: number): void {
        this.getSubDescriptiveArticles(descriptiveArticleControl).insert(j + 1, this.initSubDescriptiveArticles());
    }

    private initDescriptiveArticles(descriptiveArticle?: DescriptiveArticle): FormGroup {
        if (descriptiveArticle === undefined) {
            return new FormGroup({
                description: new FormControl(''),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                sub_descriptive_articles: new FormArray([
                    this.initSubDescriptiveArticles()
                ])
            });
        } else {
            const subDescriptiveArticles: FormGroup[] = [];
            descriptiveArticle.descriptive_article.forEach((subDescriptiveArticle) => {
                subDescriptiveArticles.push(this.initSubDescriptiveArticles(subDescriptiveArticle));
            });
            return new FormGroup({
                description: new FormControl(descriptiveArticle.description),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                sub_descriptive_articles: new FormArray(subDescriptiveArticles)
            });
        }
    }

    private initSubDescriptiveArticles(subDescriptiveArticle?: DescriptiveArticle): FormGroup {
        let subDescriptiveArticleGroup;
        if (subDescriptiveArticle === undefined) {
            subDescriptiveArticleGroup = new FormGroup({
                description: new FormControl(''),
                amount: new FormControl(1),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: new FormControl(0.0),
                alternative: new FormControl(false)
            });
        } else {
            subDescriptiveArticleGroup = new FormGroup({
                description: new FormControl(subDescriptiveArticle.description),
                amount: new FormControl(subDescriptiveArticle.amount),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: new FormControl(subDescriptiveArticle.single_price),
                alternative: new FormControl(subDescriptiveArticle.alternative)
            });
        }

        this.subscription.add(subDescriptiveArticleGroup.get('single_price').valueChanges.subscribe(
            () => {
                this.recalculateOfferPrice();
            }));
        this.subscription.add(subDescriptiveArticleGroup.get('amount').valueChanges.subscribe(
            () => {
                this.recalculateOfferPrice();
            }));
        return subDescriptiveArticleGroup;

    }

    private onOfferDeleteClicked() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Angebot löschen?',
                text: 'Dieser Schritt kann nicht rückgängig gemacht werden.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (!this.createMode) {
                    this.api.deleteOfferOfferOfferIdDelete(this.id).pipe(first()).subscribe(success => {
                        if (success) {
                            this.router.navigateByUrl('job/' + this.jobId.toString());
                        }
                    });
                } else {
                    this.router.navigateByUrl('job/' + this.jobId.toString());
                }
            }
        });
    }

    private fillRightSidebar(langCode: string): void {
        const langCodeLower = langCode.toLowerCase();
        this.getAndFillParameters('in_price_included', 'offer_in_price_included_' + langCodeLower);
        this.getAndFillParameters('validity', 'offer_validity_' + langCodeLower);
        this.getAndFillParameters('delivery', 'offer_delivery_' + langCodeLower);
        this.getAndFillParameters('payment', 'offer_payment_' + langCodeLower);
    }

    private getAndFillParameters(formControlName: string, key: string) {
        this.api.getParameterParameterKeyGet(key).pipe(first()).subscribe((parameter) => {
            this.offerGroup.patchValue({
                [formControlName]: parameter,
            });
        });
    }

    private initOfferGroup() {
        this.offerGroup = new FormGroup({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            in_price_included: new FormControl(''),
            validity: new FormControl(''),
            payment: new FormControl(''),
            delivery: new FormControl(''),
            date: new FormControl((new Date()).toISOString()),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vat_id: new FormControl(3),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            discount_amount: new FormControl(0),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            material_description: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            descriptive_articles: new FormArray([
                this.initDescriptiveArticles()
            ]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            offer_price: new FormControl('')
        });
    }

    private recalculateOfferPrice(): void {
        let offerPrice = 0.0;
        this.getDescriptiveArticles().controls.forEach((descriptiveArticleControl) => {
            (descriptiveArticleControl.get('sub_descriptive_articles') as FormArray).controls.forEach((subDescriptiveArticleControl) => {
                offerPrice += parseFloat(subDescriptiveArticleControl.get('single_price').value) *
                    parseFloat(subDescriptiveArticleControl.get('amount').value);
            });
        });
        this.offerGroup.get('offer_price').setValue(this.currency.transform(offerPrice, getLocaleCurrencyCode('de_DE')));
    }
}
