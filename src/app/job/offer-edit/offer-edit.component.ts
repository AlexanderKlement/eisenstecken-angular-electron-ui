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
import {Observable} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {formatDate} from '@angular/common';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';

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

    constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
        super(api, router, route, dialog);
    }

    get discountAmount(): FormControl {
        return this.offerGroup.get('discount_amount') as FormControl;
    }

    private static formatDate(datetime: string): string { //TODO: move to some sort of util class or so
        return formatDate(datetime, 'yyyy-MM-dd', 'en-US');
    }

    private static initDescriptiveArticles(descriptiveArticle?: DescriptiveArticle): FormGroup {
        if (descriptiveArticle === undefined) {
            return new FormGroup({
                description: new FormControl(''),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                sub_descriptive_articles: new FormArray([
                    OfferEditComponent.initSubDescriptiveArticles()
                ])
            });
        } else {
            const subDescriptiveArticles: FormGroup[] = [];
            descriptiveArticle.descriptive_article.forEach((subDescriptiveArticle) => {
                subDescriptiveArticles.push(OfferEditComponent.initSubDescriptiveArticles(subDescriptiveArticle));
            });
            return new FormGroup({
                description: new FormControl(descriptiveArticle.description),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                sub_descriptive_articles: new FormArray(subDescriptiveArticles)
            });
        }
    }

    private static initSubDescriptiveArticles(subDescriptiveArticle?: DescriptiveArticle): FormGroup {
        if (subDescriptiveArticle === undefined) {
            return new FormGroup({
                description: new FormControl(''),
                amount: new FormControl(1),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: new FormControl(0.0),
                alternative: new FormControl(false)
            });
        } else {
            return new FormGroup({
                description: new FormControl(subDescriptiveArticle.description),
                amount: new FormControl(subDescriptiveArticle.amount),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                single_price: new FormControl(subDescriptiveArticle.single_price),
                alternative: new FormControl(subDescriptiveArticle.alternative)
            });
        }

    }

    lockFunction = (api: DefaultService, id: number): Observable<Lock> => api.islockedOfferOfferIslockedOfferIdGet(id);

    dataFunction = (api: DefaultService, id: number): Observable<Offer> => api.readOfferOfferOfferIdGet(id);

    unlockFunction = (api: DefaultService, id: number): Observable<boolean> => api.lockOfferOfferUnlockOfferIdPost(id);


    ngOnInit(): void {
        super.ngOnInit();
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
                date: OfferEditComponent.formatDate(this.offerGroup.get('date').value),
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
                date: OfferEditComponent.formatDate(this.offerGroup.get('date').value),
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

        this.router.navigateByUrl('job/' + this.jobId.toString()); //TODO: change this to the detail view of the offer
    }

    observableReady(): void {
        super.observableReady();
        if (!this.createMode) {
            this.data$.pipe(tap(offer => this.offerGroup.patchValue(offer))).subscribe((offer) => {
                this.getDescriptiveArticles().removeAt(0);
                offer.descriptive_articles.forEach((descriptiveArticle) => {
                    this.getDescriptiveArticles().push(OfferEditComponent.initDescriptiveArticles(descriptiveArticle));
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
        this.getDescriptiveArticles().insert(index + 1, OfferEditComponent.initDescriptiveArticles());
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
        this.getSubDescriptiveArticles(descriptiveArticleControl).insert(j + 1, OfferEditComponent.initSubDescriptiveArticles());
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
            vat_id: new FormControl(2),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            discount_amount: new FormControl(0),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            material_description: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            descriptive_articles: new FormArray([
                OfferEditComponent.initDescriptiveArticles()
            ]),
        });
    }
}
