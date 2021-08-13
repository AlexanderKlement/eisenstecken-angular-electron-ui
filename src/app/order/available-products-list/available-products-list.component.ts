import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from "rxjs";
import {
  Article,
  ArticleUpdate,
  DefaultService,
  OrderedArticleCreate
} from "eisenstecken-openapi-angular-library";
import {FormControl} from "@angular/forms";
import {debounceTime, first, startWith, switchMap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {DialogData, ProductEditDialogComponent} from "./product-edit-dialog/product-edit-dialog.component";


@Component({
  selector: 'app-available-products-list',
  templateUrl: './available-products-list.component.html',
  styleUrls: ['./available-products-list.component.scss']
})
export class AvailableProductsListComponent implements OnInit {

  @Input() availableProducts$: Observable<Article[]>;
  @Input() name: string;
  @Input() orderId: number;

  search: FormControl;
  search$: Observable<Article[]>;
  articles: Article[];
  articleControl: FormControl;

  constructor(public dialog: MatDialog, private api: DefaultService) { }

  ngOnInit(): void {
    this.search = new FormControl("");
    this.articles = [];
    this.availableProducts$.subscribe((products) => { //TODO: unsubscribe here
      this.articles = products;
      this.search.setValue("");
    });
    this.articleControl = new FormControl();
    this.search$ = this.search.valueChanges.pipe(
      startWith(null), //TODO: replace this deprecated element => someday we'll have to update
      debounceTime(200),
      switchMap((filterString: string) => {
        if(!filterString){
          return of(this.articles);
        }
        filterString = filterString.toLowerCase();
        return of(this.articles.filter((element) => element.name.translation.toLowerCase().indexOf(filterString) >= 0));
      }));
  }

  private refreshOrderedArticleList() : void {

  }

  copyButtonClicked(article: Article) : void {
    const dialogData = AvailableProductsListComponent.createEmptyDialogData(article, "Artikel kopieren und hinzufügen");
    const closeFunction = (result: any) => {
      const orderedArticleCreate = AvailableProductsListComponent.mapDialogData2OrderedArticleCreate(result, article.id);
      const articleUpdate = AvailableProductsListComponent.mapDialogData2ArticleUpdate(result);
      this.api.copyArticleAndModifyArticleArticleIdPost(article.id, articleUpdate).pipe(first()).subscribe((article) => {
        orderedArticleCreate.article_id = article.id;
        this.api.addOrderedArticleToOrderOrderOrderedArticleOrderIdPut(this.orderId, orderedArticleCreate).pipe(first()).subscribe(() => {
          this.refreshOrderedArticleList();
        });
      });
    };
    this.openDialog(dialogData, closeFunction);
  }

  orderButtonClicked(article: Article) : void {
    const dialogData = AvailableProductsListComponent.createEmptyDialogData(article, "Artikel hinzufügen");
    const closeFunction = (result: any) => {
      const orderedArticleCreate = AvailableProductsListComponent.mapDialogData2OrderedArticleCreate(result, article.id);
      const articleUpdate = AvailableProductsListComponent.mapDialogData2ArticleUpdate(result);
      this.api.patchArticleArticleArticleIdPatch(article.id, articleUpdate).pipe(first()).subscribe((article) => {
        orderedArticleCreate.article_id = article.id;
        this.api.addOrderedArticleToOrderOrderOrderedArticleOrderIdPut(this.orderId, orderedArticleCreate).pipe(first()).subscribe(() => {
          this.refreshOrderedArticleList();
        });
      });
    };
    this.openDialog(dialogData, closeFunction);
  }

  private static mapDialogData2ArticleUpdate(dialogData: DialogData): ArticleUpdate {
    return {
      mod_number: dialogData.mod_number,
      price: dialogData.price,
      unit_id: dialogData.unit_id,
      name_de: dialogData.name,
      name_it: dialogData.name,
      description_de: dialogData.custom_description,
      description_it: dialogData.custom_description,
      vat_id: dialogData.vat_id,
    };
  }

  private static mapDialogData2OrderedArticleCreate(dialogData: DialogData, article_id: number) : OrderedArticleCreate {
    return {
      amount: dialogData.amount,
      discount: dialogData.discount,
      vat_id: dialogData.vat_id,
      custom_description: dialogData.custom_description,
      article_id: article_id,
      ordered_unit_id: dialogData.unit_id,
      price: dialogData.price
    };
  }

  private static createEmptyDialogData(article: Article, title: string): DialogData {
    return {
      title: title,
      amount: 0,
      discount: 0,
      custom_description: article.description.translation,
      name: article.name.translation,
      description: article.description.translation,
      price: article.price,
      mod_number: article.mod_number,
      vat_id: article.vat.id,
      unit_id: article.unit.id
    };
  }

  openDialog(dialogData: DialogData,  closeFunction: (result: any) => void): void {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '250px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(closeFunction);
  }

}
