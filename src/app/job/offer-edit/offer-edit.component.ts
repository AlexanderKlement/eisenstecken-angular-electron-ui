import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {BaseEditComponent} from "../../shared/components/base-edit/base-edit.component";
import {
  DefaultService,
  OfferCreate,
  OfferUpdate,
  Lock,
  Offer,
  DescriptiveArticleCreate, Vat
} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {first, tap} from "rxjs/operators";
import {formatDate} from '@angular/common';
import {OrderedArticleEditComponent} from "./ordered-article-edit/ordered-article-edit.component";

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

  private static formatDate(datetime: string) { //TODO: move to some sort of util class or so
    return formatDate(datetime, 'yyyy-MM-dd', 'en-US');
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

  get discountAmount(): FormControl {
    return this.offerGroup.get('discount_amount') as FormControl;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.vatOptions$ = this.api.readVatsVatGet();
    if (this.createMode){
      this.routeParams.subscribe((params) => {
        this.jobId = parseInt(params.job_id);
        if (isNaN(this.jobId)) {
          console.error("OfferEdit: Cannot determine job id");
          this.router.navigateByUrl(this.navigationTarget);
        }
        this.navigationTarget = "job/edit/" +this.jobId.toString();
        this.api.readJobJobJobIdGet(this.jobId).pipe(first()).subscribe((job) => {
          this.fillRightSidebar(job.client.language.code);
        });
      });
    }
    this.offerGroup = new FormGroup({
      in_price_included: new FormControl(""),
      validity: new FormControl(""),
      payment: new FormControl(""),
      delivery: new FormControl(""),
      date: new FormControl((new Date()).toISOString()),
      vat_id: new FormControl(2),
      discount_amount: new FormControl(0),
      material_description: new FormControl(""),
      descriptive_articles: new FormArray([]),
    });
  }

  getDescriptiveArticleFromArray(): FormArray {
    return this.offerGroup.get('descriptive_articles') as FormArray;
  }

  getDescriptiveArticleRow(index: number): FormGroup {
    return this.getDescriptiveArticleFromArray().at(index) as FormGroup;
  }

  private createDescriptiveArticle(index: number, descriptive_article_offline?: number): DescriptiveArticleCreate {
    const descriptiveArticle = this.getDescriptiveArticleRow(index);
    if(descriptive_article_offline != null){
      return  {
        name: descriptiveArticle.get("name").value,
        amount: descriptiveArticle.get("amount").value,
        description: descriptiveArticle.get("description").value,
        single_price: descriptiveArticle.get("single_price").value,
        discount: 0, //descriptiveArticle.get("discount").value,
        alternative: descriptiveArticle.get("alternative").value,
        vat_id: 1,
        descriptive_article_offline: descriptive_article_offline,
        descriptive_article_id_offline: index,
      };
    } else {
      return  {
        name: descriptiveArticle.get("name").value,
        amount: 0.0,
        description: "",
        single_price: 0.0,
        discount: 0.0,
        alternative: false,
        vat_id: 1,
        descriptive_article_offline: descriptive_article_offline,
        descriptive_article_id_offline: index,
      };
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const descriptiveArticles = [];

    let lastId = 0;
    for (let index = 0 ; index < this.getDescriptiveArticleFromArray().controls.length; index++) {
      const currentDescriptiveArticle = this.getDescriptiveArticleRow(index);
      let newDescriptiveArticle: DescriptiveArticleCreate;
      if(currentDescriptiveArticle.value.header_article == -1){
        newDescriptiveArticle = this.createDescriptiveArticle(index,  null);
        lastId = index;
      } else {
        newDescriptiveArticle = this.createDescriptiveArticle(index, lastId);
      }
      descriptiveArticles.push(newDescriptiveArticle);
    }

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
      console.log("navigatin");
      this.router.navigateByUrl("job/" + this.jobId.toString()); //TODO: change this to the detail view of the offer
    });
  }

  observableReady(): void {
    super.observableReady(); //TODO: fill in the descriptive articles here
    if (!this.createMode) {
      this.data$.pipe(tap(offer => this.offerGroup.patchValue(offer))).subscribe((offer) => {
        this.offerGroup.patchValue({
          in_price_included: offer.in_price_included,
          validity: offer.validity,
          payment: offer.payment,
          delivery: offer.delivery,
          date: offer.date, //remove this line if always today's date should be shown
          discount_amount: offer.discount_amount,
          material_description: offer.material_description
        });
      });
    }
  }


  private fillRightSidebar(langCode: string): void {
    const langCodeLower = langCode.toLowerCase();
    this.getAndFillParameters("in_price_included", "offer_in_price_included_" + langCodeLower);
    this.getAndFillParameters("validity", "offer_validity_" + langCodeLower);
    this.getAndFillParameters("delivery", "offer_delivery_" + langCodeLower);
    this.getAndFillParameters("payment", "offer_payment_" + langCodeLower);
  }

  private getAndFillParameters(formControlName: string, key: string){
    this.api.getParameterParameterKeyGet(key).pipe(first()).subscribe((parameter) => {
      this.offerGroup.patchValue({
        [formControlName]: parameter,
      });
    });
  }


}
