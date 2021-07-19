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

  orderedArticlesGroup: FormGroup;
  @Input() orderedArticles: FormArray;
  vatOptions$: Observable<Vat[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.vatOptions$ = this.api.readVatsVatGet();
    this.orderedArticlesGroup = new FormGroup({
      articles: this.orderedArticles,
    });
  }

  addEmptyOrderedArticle(): void {
    const emptyFormGroup = new FormGroup({
      amount:new FormControl(""),
      discount: new FormControl("0"),
      vat: new FormControl(""),
      custom_description: new FormControl(""),
      alternative: new FormControl(false),
      ordered_unit_id: new FormControl(""),
      article_id: new FormControl(""),
    });
    this.orderedArticles.push(emptyFormGroup);
  }

  addOrderedArticleClicked(): void {
    console.log("Adding an ordered article");
    this.addEmptyOrderedArticle();
  }

  removeOrderedArticleClicked(rowNumber: number): void {
    if(this.orderedArticles.length > 1){
      this.removeOrderedArticle(rowNumber);
    }
  }


  private removeOrderedArticle(rowNumber: number) {
    this.orderedArticles.removeAt(rowNumber);
  }
}
