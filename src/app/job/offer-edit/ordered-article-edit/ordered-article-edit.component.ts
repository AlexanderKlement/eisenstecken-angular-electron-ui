import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {DefaultService, Vat} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";

export interface OrderedArticleType {
  amount: string,
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

  constructor(private api: DefaultService) {
  }

  ngOnInit(): void {
    this.vatOptions$ = this.api.readVatsVatGet();
    this.descriptiveArticlesGroup = new FormGroup({
      articles: this.descriptiveArticles,
    });
    if (this.descriptiveArticles.length == 0) {
      this.addLine(-1);
    }
  }

  addLine(header: number): void {
    const emptyFormGroup = new FormGroup({
      name: new FormControl(""),
      description: new FormControl(""),
      amount: new FormControl(1),
      single_price: new FormControl(""),
      discount: new FormControl(0),
      alternative: new FormControl(false),
      header_article: new FormControl(header),
    });
    if (header == -1) {
      this.descriptiveArticles.push(emptyFormGroup);
    } else {
      this.descriptiveArticles.insert(this.getIdOfLastSlaveOfDescriptiveArticleGroup(header), emptyFormGroup);
    }
  }

  addHeaderClicked(): void {
    console.log("Adding a new Header to the bottom");
    this.addLine(-1);
  }

  addDescriptiveArticle(headerArticle: number): void {
    console.log("Adding a new descriptive Article");
    this.addLine(headerArticle);
  }

  removeOrderedArticleClicked(rowNumber: number): void {
    if (this.descriptiveArticles.length > 1) {
      this.removeOrderedArticle(rowNumber);
    }
  }

  removeLine(i: number): void {
    const article = this.descriptiveArticles.at(i).value;
    //TODO: check if slaves
  }

  private getIdOfLastSlaveOfDescriptiveArticleGroup(headerId: number): number {
    for (let index = (headerId + 1); index < this.descriptiveArticles.length; index++) {
      const slaveIndex = parseInt(this.descriptiveArticles.at(headerId).value.header_article);
      if (slaveIndex != headerId) {
        return headerId + 1;
      }
    }
    return this.descriptiveArticles.length;
  }

  private removeOrderedArticle(rowNumber: number) {
    this.descriptiveArticles.removeAt(rowNumber);
  }
}
