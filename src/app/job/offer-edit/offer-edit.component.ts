import {Component, OnInit} from '@angular/core';
import {AbstractControl, Form, FormArray, FormControl, FormGroup} from "@angular/forms";
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {
  DefaultService,
  OfferCreate,
  OfferUpdate,
  Lock,
  Offer,
  DescriptiveArticleCreate, Vat, DescriptiveArticle
} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {first, tap} from "rxjs/operators";
import {formatDate, CommonModule} from '@angular/common';

@Component({
  selector: 'app-offer-edit',
  templateUrl: './offer-edit.component.html',
  styleUrls: ['./offer-edit.component.scss']
})
export class OfferEditComponent extends BaseEditComponent<Offer> implements OnInit {

  navigationTarget = "job";
  jobId: number;
  offerGroup: FormGroup;
  submitted: boolean;
  vatOptions$: Observable<Vat[]>;

  constructor(api: DefaultService, router: Router, route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  get discountAmount(): FormControl {
    return this.offerGroup.get('discount_amount') as FormControl;
  }

  private static formatDate(datetime: string) { //TODO: move to some sort of util class or so
    return formatDate(datetime, 'yyyy-MM-dd', 'en-US');
  }

  private static initDescriptiveArticles(descriptiveArticle?: DescriptiveArticle): FormGroup {
    if(descriptiveArticle === undefined){
      return new FormGroup({
        description: new FormControl(""),
        sub_descriptive_articles: new FormArray([
          OfferEditComponent.initSubDescriptiveArticles()
        ])
      });
    }
    else {
      const subDescriptiveArticles: FormGroup[] = [];
      descriptiveArticle.descriptive_article.forEach((subDescriptiveArticle) => {
        subDescriptiveArticles.push(OfferEditComponent.initSubDescriptiveArticles(subDescriptiveArticle));
      });
      return new FormGroup({
        description: new FormControl(descriptiveArticle.description),
        sub_descriptive_articles: new FormArray(subDescriptiveArticles)
      });
    }
  }

  private static initSubDescriptiveArticles(subDescriptiveArticle?: DescriptiveArticle): FormGroup {
    if(subDescriptiveArticle === undefined){
      return new FormGroup({
        description: new FormControl(""),
        amount: new FormControl(1),
        single_price: new FormControl(0.0),
        alternative: new FormControl(false)
      });
    } else {
      return new FormGroup({
        description: new FormControl(subDescriptiveArticle.description),
        amount: new FormControl(subDescriptiveArticle.amount),
        single_price: new FormControl(subDescriptiveArticle.single_price),
        alternative: new FormControl(subDescriptiveArticle.alternative)
      });
    }

  }

  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedOfferOfferIslockedOfferIdGet(id);
  };

  dataFunction = (api: DefaultService, id: number): Observable<Offer> => {
    return api.readOfferOfferOfferIdGet(id);
  };

  unlockFunction = (afterUnlockFunction: VoidFunction = () => {
  }): void => {
    if (this.createMode) {
      afterUnlockFunction();
      return;
    }
    this.api.lockOfferOfferUnlockOfferIdPost(this.id).subscribe(() => {
      afterUnlockFunction();
    });
  };

  ngOnInit(): void {
    super.ngOnInit();
    this.vatOptions$ = this.api.readVatsVatGet();
    this.initOfferGroup();
    if (this.createMode) {
      this.routeParams.subscribe((params) => {
        this.jobId = parseInt(params.job_id);
        if (isNaN(this.jobId)) {
          console.error("OfferEdit: Cannot determine job id");
          this.router.navigateByUrl(this.navigationTarget);
        }
        this.navigationTarget = "job/edit/" + this.jobId.toString();
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
          name: "",
          amount: subDescriptiveArticleControl.get("amount").value,
          description: subDescriptiveArticleControl.get("description").value,
          single_price: subDescriptiveArticleControl.get("single_price").value,
          discount: 0,
          alternative: subDescriptiveArticleControl.get("alternative").value,
          vat_id: 1,
        };
        subDescriptiveArticleArray.push(subDescriptiveArticle);
      });
      const descriptiveArticle: DescriptiveArticleCreate = {
        name: "",
        amount: 0,
        description: descriptiveArticleControl.get("description").value,
        single_price: 0,
        discount: 0,
        alternative: false,
        descriptive_articles: subDescriptiveArticleArray,
        vat_id: 1,
      };
      descriptiveArticles.push(descriptiveArticle);
    });


    if (this.createMode) {
      const offerCreate: OfferCreate = {
        date: OfferEditComponent.formatDate(this.offerGroup.get("date").value),
        in_price_included: this.offerGroup.get("in_price_included").value,
        validity: this.offerGroup.get("validity").value,
        payment: this.offerGroup.get("payment").value,
        delivery: this.offerGroup.get("delivery").value,
        job_id: this.jobId,
        vat_id: this.offerGroup.get("vat_id").value,
        descriptive_articles: descriptiveArticles,
        discount_amount: this.offerGroup.get("discount_amount").value,
        material_description: this.offerGroup.get("material_description").value
      };
      this.api.createOfferOfferPost(offerCreate).subscribe((offer) => {
        this.createUpdateSuccess(offer);
      }, (error) => {
        this.createUpdateError(error);
      }, () => {
        this.createUpdateComplete();
      });
    } else {
      const offerUpdate: OfferUpdate = {
        date: OfferEditComponent.formatDate(this.offerGroup.get("date").value),
        in_price_included: this.offerGroup.get("in_price_included").value,
        validity: this.offerGroup.get("validity").value,
        payment: this.offerGroup.get("payment").value,
        delivery: this.offerGroup.get("delivery").value,
        descriptive_articles: descriptiveArticles,
        vat_id: this.offerGroup.get("vat_id").value,
        discount_amount: this.offerGroup.get("discount_amount").value,
        material_description: this.offerGroup.get("material_description").value
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
    this.unlockFunction(() => {
      this.router.navigateByUrl("job/" + this.jobId.toString()); //TODO: change this to the detail view of the offer
    });
  }

  observableReady(): void {
    super.observableReady();
    if (!this.createMode) {
      this.data$.pipe(tap(offer => this.offerGroup.patchValue(offer))).subscribe((offer) => {
        this.removeDescriptiveArticle(0);
        offer.descriptive_articles.forEach((descriptiveArticle) => {
          this.getDescriptiveArticles().push(OfferEditComponent.initDescriptiveArticles(descriptiveArticle));
        });
        this.offerGroup.patchValue({
          in_price_included: offer.in_price_included,
          validity: offer.validity,
          payment: offer.payment,
          delivery: offer.delivery,
          //date: offer.date, //remove this line if always today's date should be shown -> and vice versa
          discount_amount: offer.discount_amount,
          material_description: offer.material_description
        });
        this.jobId = offer.job_id;
      });

    }
  }

  getDescriptiveArticles(): FormArray {
    return this.offerGroup.get("descriptive_articles") as FormArray;
  }

  getSubDescriptiveArticles(formGroup: AbstractControl): FormArray {
    return formGroup.get("sub_descriptive_articles") as FormArray;
  }

  removeDescriptiveArticle(index: number): void {
    this.getDescriptiveArticles().removeAt(index);
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
    this.getSubDescriptiveArticles(descriptiveArticleControl).removeAt(j);
  }

  addDescriptiveSubArticle(descriptiveArticleControl: AbstractControl, j: number): void {
    this.getSubDescriptiveArticles(descriptiveArticleControl).insert(j + 1, OfferEditComponent.initSubDescriptiveArticles());
  }

  private fillRightSidebar(langCode: string): void {
    const langCodeLower = langCode.toLowerCase();
    this.getAndFillParameters("in_price_included", "offer_in_price_included_" + langCodeLower);
    this.getAndFillParameters("validity", "offer_validity_" + langCodeLower);
    this.getAndFillParameters("delivery", "offer_delivery_" + langCodeLower);
    this.getAndFillParameters("payment", "offer_payment_" + langCodeLower);
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
      in_price_included: new FormControl(""),
      validity: new FormControl(""),
      payment: new FormControl(""),
      delivery: new FormControl(""),
      date: new FormControl((new Date()).toISOString()),
      vat_id: new FormControl(2),
      discount_amount: new FormControl(0),
      material_description: new FormControl(""),
      descriptive_articles: new FormArray([
        OfferEditComponent.initDescriptiveArticles()
      ]),
    });
  }
}
