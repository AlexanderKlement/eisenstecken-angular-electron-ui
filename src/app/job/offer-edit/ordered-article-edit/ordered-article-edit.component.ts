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

  getDescriptiveArticleArray(): FormArray {
    return this.descriptiveArticlesGroup.get("articles") as FormArray;
  }

  getDescriptiveArticleRow(row: number): FormGroup {
    return this.getDescriptiveArticleArray().at(row) as FormGroup;
  }

  insertDescriptiveArticleRow(index: number, formGroup: FormGroup): void {
    return this.getDescriptiveArticleArray().insert(index, formGroup);
  }

  existsDescriptiveArticleRow(index: number): boolean {
    return index in this.getDescriptiveArticleArray().controls;
  }

  pushDescriptiveArticleRow(formGroup: FormGroup): void {
    return this.getDescriptiveArticleArray().push(formGroup);
  }

  removeDescriptiveArticleRow(row: number) : void {
    return this.getDescriptiveArticleArray().removeAt(row);
  }

  public static getEmptyFormGroup(header: number): FormGroup {
    return  new FormGroup({
      name: new FormControl(""),
      description: new FormControl(""),
      amount: new FormControl(1),
      single_price: new FormControl(0),
      discount: new FormControl(0),
      alternative: new FormControl(false),
      header_article: new FormControl(header),
    });
  }

  addLine(header: number): void {
    const emptyFormGroup = OrderedArticleEditComponent.getEmptyFormGroup(header);
    if (header == -1) {
      this.pushDescriptiveArticleRow(emptyFormGroup);
    } else {
      this.insertDescriptiveArticleRow(this.getIdOfLastSlaveOfDescriptiveArticleGroup(header), emptyFormGroup);
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

  lineRemovable(rowNumber: number): boolean {
    return this.isSlave(rowNumber) || !this.existsSlave(rowNumber);
  }

  private existsSlave(rowNumber: number): boolean {
    if(!this.existsDescriptiveArticleRow(rowNumber + 1))
      return false;
    return this.isSlave(rowNumber + 1);
  }

  private isSlave(rowNumber: number): boolean{
    return !this.isMaster(rowNumber);
  }

  private isMaster(rowNumber: number): boolean {
    if(this.existsDescriptiveArticleRow(rowNumber))
      return this.getDescriptiveArticleRow(rowNumber).value.header_article == -1;
    console.error("OrderArticleEdit: Index out of range");
    return false;
  }

  removeLine(rowId: number): void {
    this.removeDescriptiveArticleRow(rowId);
  }

  private getIdOfLastSlaveOfDescriptiveArticleGroup(headerId: number): number { //Use this function with caution, it does not really what it seems l
    for (let index = (headerId + 1); index < this.getDescriptiveArticleArray().controls.length; index++) {
      if(this.isMaster(index)){
        return index;
      }
    }
    return this.getDescriptiveArticleArray().controls.length;
  }
}
