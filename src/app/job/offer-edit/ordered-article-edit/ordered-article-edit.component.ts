import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {DefaultService, Vat} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";

export interface OrderedArticleType {
  amount:string,
  discount: string,
  vat: string,
  custom_description: string,
  alternative: string,
  ordered_unit_id: string,
  article_id: string
}

@Component({
  selector: 'app-ordered-article-edit',
  templateUrl: './ordered-article-edit.component.html',
  styleUrls: ['./ordered-article-edit.component.scss']
})

export class OrderedArticleEditComponent implements OnInit {

  descriptiveArticlesGroup: FormGroup;
  @Input() descriptiveArticles: FormArray;
  vatOptions$: Observable<Vat[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.vatOptions$ = this.api.readVatsVatGet();
    this.descriptiveArticlesGroup = new FormGroup({
      articles: this.descriptiveArticles,
    });
    if(this.descriptiveArticles.length == 0){
      this.addLine();
    }
  }

  addLine(header?: number): void {
    const emptyFormGroup = new FormGroup({
      name:new FormControl(""),
      description: new FormControl(""),
      amount: new FormControl(1),
      single_price: new FormControl(""),
      discount: new FormControl(0),
      alternative: new FormControl(false),
      header_article: new FormControl(header),
    });
    if(header == null){
      this.descriptiveArticles.push(emptyFormGroup);
    }
  }

  addHeaderClicked(): void {
    console.log("Adding a new Header to the bottom");
    this.addLine();
  }

  addDescriptiveArticle(headerArticle: number): void {
    console.log("Adding a new descriptive Article");
    this.addLine(headerArticle);
  }

  removeOrderedArticleClicked(rowNumber: number): void {
    if(this.descriptiveArticles.length > 1){
      this.removeOrderedArticle(rowNumber);
    }
  }

  private removeOrderedArticle(rowNumber: number) {
    this.descriptiveArticles.removeAt(rowNumber);
  }
}
