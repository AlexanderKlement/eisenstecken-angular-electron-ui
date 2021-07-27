import { Component, OnInit } from '@angular/core';
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
import {tap} from "rxjs/operators";
import {formatDate } from '@angular/common';

@Component({
  selector: 'app-offer-edit',
  templateUrl: './offer-edit.component.html',
  styleUrls: ['./offer-edit.component.scss']
})
export class OfferEditComponent extends BaseEditComponent<Offer> implements OnInit {

  navigationTarget = "/offer";
  lockFunction = (api: DefaultService, id: number): Observable<Lock> => {
    return api.islockedOfferOfferIslockedOfferIdGet(id);
  };
  dataFunction = (api: DefaultService, id: number): Observable<Offer> => {
    return api.readOfferOfferOfferIdGet(id);
  };
  unlockFunction = (afterUnlockFunction: VoidFunction = () => {}): void => {
    if(this.createMode){
      afterUnlockFunction();
      return;
    }
    this.api.lockOfferOfferUnlockOfferIdPost(this.id).subscribe(() => {
      afterUnlockFunction();
    });
  };
  jobId: number;

  offerGroup: FormGroup;
  submitted: boolean;
  vatOptions$: Observable<Vat[]>;

  constructor(api: DefaultService, router: Router,  route: ActivatedRoute, dialog: MatDialog) {
    super(api, router, route, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.vatOptions$ = this.api.readVatsVatGet();
    if(this.createMode)
      this.routeParams.subscribe((params) => {
        this.jobId =  parseInt(params.job_id);
        if(isNaN(this.jobId)){
          console.error("OfferEdit: Cannot determine job id");
          this.router.navigateByUrl(this.navigationTarget);
        }
      });
    this.offerGroup = new FormGroup({
      in_price_included: new FormControl(""),
      in_price_excluded: new FormControl(""),
      payment: new FormControl(""),
      delivery: new FormControl(""),
      date: new FormControl(""),
      descriptive_articles: new FormArray([
        new FormGroup({
          name:new FormControl(""),
          description: new FormControl(""),
          amount: new FormControl(""),
          single_price: new FormControl(""),
          discount: new FormControl(""),
          alternative: new FormControl(""),
          header_article: new FormControl("")
        })
      ]),

    });
  }

  getDescriptiveArticleFromArray() : FormArray {
    return (this.offerGroup.get('descriptive_articles') as FormArray);
  }

  onSubmit() : void {
    this.submitted = true;
    const descriptiveArticles = [];
    for(const descriptiveArticle of this.getDescriptiveArticleFromArray().controls) {
      const tempArticle:DescriptiveArticleCreate = {
        name: descriptiveArticle.get("name").value,
        amount: descriptiveArticle.get("amount").value,
        description: descriptiveArticle.get("description").value,
        single_price: descriptiveArticle.get("single_price").value,
        discount: descriptiveArticle.get("discount").value,
        alternative: descriptiveArticle.get("alternative").value,
      };
      descriptiveArticles.push(tempArticle);
    }

    if(this.createMode){
      const offerCreate: OfferCreate = {
        date: OfferEditComponent.formatDate(this.offerGroup.get("date").value),
        in_price_included: this.offerGroup.get("in_price_included").value,
        in_price_excluded: this.offerGroup.get("in_price_excluded").value,
        payment: this.offerGroup.get("payment").value,
        delivery: this.offerGroup.get("delivery").value,
        job_id: this.jobId,
        descriptive_articles: descriptiveArticles,
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
        in_price_excluded: this.offerGroup.get("in_price_excluded").value,
        payment: this.offerGroup.get("payment").value,
        delivery: this.offerGroup.get("delivery").value,
        descriptive_articles: descriptiveArticles,
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

  observableReady() :void {
    super.observableReady(); //TODO: fill in the descriptive articles here
    if(!this.createMode){
      this.data$.pipe(tap(offer => this.offerGroup.patchValue(offer))).subscribe((offer) => {
        this.offerGroup.patchValue({
          in_price_included: offer.in_price_included,
          in_price_excluded: offer.in_price_excluded,
          payment: offer.payment,
          delivery: offer.delivery,
          date: offer.date
        });
      });
    }
  }

  private static formatDate(datetime: string){ //TODO: move to some sort of util class or so
    return formatDate(datetime, 'yyyy-MM-dd', 'en-US');
  }


}
