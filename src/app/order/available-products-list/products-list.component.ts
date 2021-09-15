import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {
    Article,
    ArticleUpdate,
    DefaultService,
    OrderedArticle,
    OrderedArticleCreate
} from 'eisenstecken-openapi-angular-library';
import {FormControl} from '@angular/forms';
import {debounceTime, first, startWith, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {DialogData, ProductEditDialogComponent} from './product-edit-dialog/product-edit-dialog.component';


@Component({
    selector: 'app-products-list',
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

    @Input() availableProducts$: Observable<Article[]>;
    @Input() orderedProducts$: Observable<OrderedArticle[]>;
    @Input() name: string;
    @Input() orderId: number;
    @Input() available: boolean;

    @Output() onRefreshOrderedArticleListEmitter = new EventEmitter();
    @Output() onRefreshAvailableArticleListEmitter = new EventEmitter();

    search: FormControl;
    searchAvailableArticles$: Observable<Article[]>;
    searchOrderedArticles$: Observable<OrderedArticle[]>;
    orderedArticles: OrderedArticle[];
    articles: Article[];

    constructor(public dialog: MatDialog, private api: DefaultService) {
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

    private static mapDialogData2OrderedArticleCreate(dialogData: DialogData, article_id: number): OrderedArticleCreate {
        console.log(dialogData);
        return {
            amount: dialogData.amount,
            discount: dialogData.discount,
            vat_id: dialogData.vat_id,
            custom_description: dialogData.custom_description,
            article_id,
            ordered_unit_id: dialogData.unit_id,
            price: dialogData.price
        };
    }

    private static createEmptyDialogData(article: Article, title: string): DialogData {
        return {
            title,
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

    ngOnInit(): void {
        this.search = new FormControl('');
        if (this.available) {
            this.articles = [];
            this.availableProducts$.subscribe((products) => { //TODO: unsubscribe here
                this.articles = products;
                this.search.setValue('');
            });
            this.searchAvailableArticles$ = this.search.valueChanges.pipe(
                startWith(null), //TODO: replace this deprecated element => someday we'll have to update
                debounceTime(200),
                switchMap((filterString: string) => {
                    if (!filterString) {
                        return of(this.articles);
                    }
                    filterString = filterString.toLowerCase();
                    return of(this.articles.filter((element) => element.name.translation.toLowerCase().indexOf(filterString) >= 0));
                }));
        } else {
            this.orderedArticles = [];
            this.orderedProducts$.subscribe((products) => { //TODO: unsubscribe here
                this.orderedArticles = products;
                this.search.setValue('');
            });
            this.searchOrderedArticles$ = this.search.valueChanges.pipe(
                startWith(null), //TODO: replace this deprecated element => someday we'll have to update
                debounceTime(200),
                switchMap((filterString: string) => {
                    if (!filterString) {
                        return of(this.orderedArticles);
                    }
                    filterString = filterString.toLowerCase();
                    return of(this.orderedArticles.filter((element) => element.article.name.translation.toLowerCase().indexOf(filterString) >= 0));
                }));
        }
    }

    copyButtonClicked(article: Article): void {
        const dialogData = ProductsListComponent.createEmptyDialogData(article, 'Produkt kopieren und hinzufügen');
        const closeFunction = (result: any) => {
            const orderedArticleCreate = ProductsListComponent.mapDialogData2OrderedArticleCreate(result, article.id);
            const articleUpdate = ProductsListComponent.mapDialogData2ArticleUpdate(result);
            this.api.copyArticleAndModifyArticleArticleIdPost(article.id, articleUpdate).pipe(first()).subscribe((article) => {
                orderedArticleCreate.article_id = article.id;
                this.refreshAvailableOrderList();
                this.api.addOrderedArticleToOrderOrderOrderedArticleOrderIdPut(this.orderId, orderedArticleCreate).pipe(first()).subscribe(() => {
                    this.refreshOrderedArticleList();
                });
            });
        };
        this.openDialog(dialogData, closeFunction);
    }

    orderButtonClicked(article: Article): void {
        const dialogData = ProductsListComponent.createEmptyDialogData(article, 'Produkt hinzufügen');
        const closeFunction = (result: any) => {
            const orderedArticleCreate = ProductsListComponent.mapDialogData2OrderedArticleCreate(result, article.id);
            const articleUpdate = ProductsListComponent.mapDialogData2ArticleUpdate(result);
            this.api.patchArticleArticleArticleIdPatch(article.id, articleUpdate).pipe(first()).subscribe((article) => {
                orderedArticleCreate.article_id = article.id;
                this.api.addOrderedArticleToOrderOrderOrderedArticleOrderIdPut(this.orderId, orderedArticleCreate).pipe(first()).subscribe(() => {
                    this.refreshOrderedArticleList();
                });
            });
        };
        this.openDialog(dialogData, closeFunction);
    }

    openDialog(dialogData: DialogData, closeFunction: (result: any) => void): void {
        const dialogRef = this.dialog.open(ProductEditDialogComponent, {
            width: '250px',
            data: dialogData
        });
        dialogRef.afterClosed().subscribe(closeFunction);
    }

    editButtonClicked(orderedArticle: OrderedArticle): void {
        const dialogData$ = this.createEditDialogData(orderedArticle, 'Produkt bearbeiten');
        const closeFunction = (result: any) => {
            const orderedArticleCreate = ProductsListComponent.mapDialogData2OrderedArticleCreate(result, orderedArticle.article.id);
            const articleUpdate = ProductsListComponent.mapDialogData2ArticleUpdate(result);
            this.api.patchArticleArticleArticleIdPatch(orderedArticle.article.id, articleUpdate).pipe(first()).subscribe((article) => {
                orderedArticleCreate.article_id = article.id;
                this.api.updateOrderedArticleOrderArticleOrderedArticleIdPut(orderedArticle.id, orderedArticleCreate).pipe(first()).subscribe(() => {
                    this.refreshOrderedArticleList();
                });
            });
        };
        dialogData$.pipe(first()).subscribe((dialogData) => {
            this.openDialog(dialogData, closeFunction);
        });
    }

    removeButtonClicked(orderedArticle: OrderedArticle): void {
        this.api.deleteOrdererArticleOrderOrderedArticleOrderedArticleIdDelete(orderedArticle.id).pipe(first()).subscribe((success) => {
            if (success) {
                this.refreshOrderedArticleList();
            } //TODO: error handling

        });
    }

    private refreshOrderedArticleList(): void {
        this.onRefreshOrderedArticleListEmitter.emit();
    }

    private createEditDialogData(orderedArticle: OrderedArticle, title: string): Observable<DialogData> {
        return new Observable<DialogData>((dialogDataSubscriber) => {
            this.api.readVatByAmountVatVatAmountGet(orderedArticle.vat).pipe(first()).subscribe((vat) => {
                const dialogData = ProductsListComponent.createEmptyDialogData(orderedArticle.article, title);
                dialogData.amount = orderedArticle.amount;
                dialogData.discount = orderedArticle.discount;
                dialogData.custom_description = orderedArticle.custom_description;
                dialogData.price = orderedArticle.price;
                dialogData.unit_id = orderedArticle.ordered_unit.id;
                dialogData.vat_id = vat.id;
                dialogDataSubscriber.next(dialogData);
            });
        });
    }

    private refreshAvailableOrderList() {
        this.onRefreshAvailableArticleListEmitter.emit();
    }
}
