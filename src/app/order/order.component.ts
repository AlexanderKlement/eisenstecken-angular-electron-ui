import {Component, OnInit} from '@angular/core';
import {Observable, Subscriber, combineLatest} from 'rxjs';
import {
    ListItem,
    SupportedListElements
} from '../shared/components/filterable-clickable-list/filterable-clickable-list.types';
import {Article, DefaultService, OrderableType, OrderedArticle} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {Router} from '@angular/router';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {


    toListName = 'Bestelle für Aufträge oder Lager';
    toList$: Observable<ListItem[]>; //Here go stocks and suppliers
    toListSubscriber: Subscriber<ListItem[]>;
    toListSelected: ListItem;

    fromListName = 'Bestelle von Lieferanten oder Lager';
    fromList$: Observable<ListItem[]>;
    fromListSubscriber: Subscriber<ListItem[]>;
    fromListSelected: ListItem;

    availableProductListName = 'Verfügbare Artikel';
    availableProducts$: Observable<Article[]>;
    availableProductsSubscriber: Subscriber<Article[]>;

    orderedProductListName = 'Ausgewählte Artikel';
    orderedProducts$: Observable<OrderedArticle[]>;
    orderedProductsSubscriber: Subscriber<OrderedArticle[]>;

    step = 0;

    lastOrderId: number;
    buttons: CustomButton[] = [];

    constructor(private api: DefaultService, private router: Router) {
    }

    private static createListItems(supportedListElements: SupportedListElements[]): ListItem[] {
        const listItems: ListItem[] = [];
        for (const elem of supportedListElements) {
            const listItem: ListItem = {
                name: elem.displayable_name,
                item: elem,
                type: elem.type
            };
            listItems.push(listItem);
        }
        return listItems;
    }

    ngOnInit(): void {
        this.toList$ = new Observable<ListItem[]>((toListSubscriber) => {
            this.toListSubscriber = toListSubscriber;
            this.loadToList();
        });
        this.fromList$ = new Observable<ListItem[]>((fromListSubscriber) => {
            this.fromListSubscriber = fromListSubscriber;
        });
        this.availableProducts$ = new Observable<Article[]>((availableProductsSubscriber) => {
            this.availableProductsSubscriber = availableProductsSubscriber;
        });
        this.orderedProducts$ = new Observable<OrderedArticle[]>((orderedProductsSubscriber) => {
            this.orderedProductsSubscriber = orderedProductsSubscriber;
        });
    }

    toListItemClicked(listItem: ListItem): void {
        this.resetProductWindows();
        this.decideWhichFromListToLoad(listItem);
        this.toListSelected = listItem;
        this.step = 1;
        this.clearButtons();
    }

    fromListItemClicked(listItem: ListItem): void {
        this.clearButtons();
        this.step = 2;
        this.resetProductWindows();
        this.fromListSelected = listItem;
        this.loadAvailableArticlesAndButtons();
        this.loadOrderedArticles();
    }

    refreshOrderedProducts(): void {
        this.loadOrderedArticles();
    }

    refreshAvailableProducts(): void {
        this.loadAvailableArticlesAndButtons();
    }

    loadOrderedArticles(): void {
        this.api.readOrderFromToOrderFromOrderableFromIdToOrderableToIdGet(
            this.fromListSelected.item.id, this.toListSelected.item.id).pipe(first())
            .subscribe((order) => {
                this.lastOrderId = order.id;
                this.orderedProductsSubscriber.next(order.articles);
            });
    }

    decideWhichFromListToLoad(listItem: ListItem):
        void {
        switch (listItem.type
            ) {
            case
            OrderableType.Stock
            : {
                this.loadFromList(false);
                break;
            }
            case
            OrderableType.Job
            : {
                this.loadFromList(true);
                break;
            }
            case
            OrderableType.Supplier
            : {
                console.error('OrderComponent: an item with type SUPPLIER has been clicked in TO list');
                break;
            }
        }
    }

    resetProductWindows(): void {
        if (this.availableProductsSubscriber !== undefined
        ) {
            this.availableProductsSubscriber.next([]);
        }
        if (this.orderedProductsSubscriber !== undefined) {
            this.orderedProductsSubscriber.next([]);
        }
    }

    clearButtons() {
        this.buttons = [];
    }

    private loadToList() {
        const stocks$ = this.api.readStocksStockGet().pipe(first());
        const jobs$ = this.api.readJobsJobGet(0, 1000, '', undefined, 'JOBSTATUS_ACCEPTED').pipe(first());

        combineLatest([stocks$, jobs$]).subscribe(([stocks, jobs]) => {
            const stockListItems = OrderComponent.createListItems(stocks);
            const jobListItems = OrderComponent.createListItems(jobs);
            stockListItems.push(...jobListItems);
            this.toListSubscriber.next(stockListItems);
        });
    }

    private loadFromList(withStocks: boolean) {
        const stocks$ = this.api.readStocksStockGet().pipe(first());
        const suppliers$ = this.api.readSuppliersSupplierGet().pipe(first());

        if (withStocks) {
            combineLatest([stocks$, suppliers$]).subscribe(([stocks, jobs]) => {
                const stockListItems = OrderComponent.createListItems(stocks);
                const jobListItems = OrderComponent.createListItems(jobs);
                stockListItems.push(...jobListItems);
                this.fromListSubscriber.next(stockListItems);
            });
        } else {
            suppliers$.subscribe((suppliers) => {
                this.fromListSubscriber.next(OrderComponent.createListItems(suppliers));
            });
        }

    }

    private loadAvailableArticlesAndButtons(): void {
        switch (this.fromListSelected.type) {
            case OrderableType.Stock: {
                this.api.readArticlesByStockArticleStockStockIdGet(this.fromListSelected.item.id).pipe(first())
                    .subscribe((articles) => {
                        this.availableProductsSubscriber.next(articles);
                    });
                this.buttons = [];
                this.buttons.push(
                    {
                        name: 'Öffne Lager',
                        navigate: () => {
                            this.router.navigateByUrl('stock/' + this.fromListSelected.item.id);
                        },
                    });
                break;
            }
            case
            OrderableType.Job
            : {
                console.error('OrderComponent: an item with type JOB has been clicked in FROM list');
                break;
            }
            case
            OrderableType.Supplier
            : {
                this.api.readArticlesBySupplierArticleSupplierSupplierIdGet(this.fromListSelected.item.id).pipe(first())
                    .subscribe((articles) => {
                        this.availableProductsSubscriber.next(articles);
                    });
                this.buttons = [];
                this.buttons.push(
                    {
                        name: 'Öffne Lieferant',
                        navigate: () => {
                            this.router.navigateByUrl('supplier/' + this.fromListSelected.item.id);
                        },
                    });
                break;
            }
        }
    }
}
