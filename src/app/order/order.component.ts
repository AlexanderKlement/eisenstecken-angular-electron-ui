import { Component, OnInit } from '@angular/core';
import {Observable, Subscriber, combineLatest} from "rxjs";
import {
  ListItem,
  SupportedListElements
} from "../shared/components/filterable-clickable-list/filterable-clickable-list.types";
import {Article, DefaultService, OrderableType, OrderedArticle} from "eisenstecken-openapi-angular-library";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {


  toListName = "Bestelle für Aufträge oder Lager";
  toList$ : Observable<ListItem[]>; //Here go stocks and suppliers
  toListSubscriber: Subscriber<ListItem[]>;
  toListSelected: ListItem;

  fromListName = "Bestelle von Lieferanten oder Lager";
  fromList$: Observable<ListItem[]>;
  fromListSubscriber: Subscriber<ListItem[]>;
  fromListSelected: ListItem;

  availableProductListName = "Verfügbare Produkte";
  availableProducts$: Observable<Article[]>;
  availableProductsSubscriber: Subscriber<Article[]>;

  orderedProductListName = "Bestellte Produkte";
  orderedProducts$: Observable<OrderedArticle[]>;
  orderedProductsSubscriber: Subscriber<OrderedArticle[]>;

  lastOrderId: number;

  constructor(private api: DefaultService) { }

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

  private loadToList(){
    const stocks$ = this.api.readStocksStockGet().pipe(first());
    const jobs$ = this.api.getJobsByStatusJobStatusJobStatusGet("JOBSTATUS_CREATED").pipe(first());

    combineLatest([stocks$, jobs$]).subscribe(([stocks, jobs]) => {
      const stockListItems = OrderComponent.createListItems(stocks);
      const jobListItems = OrderComponent.createListItems(jobs);
      stockListItems.push(...jobListItems);
      this.toListSubscriber.next(stockListItems);
    });
  }

  private static createListItems(supportedListElements: SupportedListElements[]): ListItem[] {
    const listItems: ListItem[] = [];
    for (const elem of supportedListElements){
      const listItem: ListItem = {
        name: elem.displayable_name,
        item: elem,
        type: elem.orderable.type
      };
      listItems.push(listItem);
    }
    return listItems;
  }

  private loadFromList(withStocks: boolean) {
    const stocks$ = this.api.readStocksStockGet().pipe(first());
    const suppliers$ = this.api.readSuppliersSupplierGet().pipe(first());

    if(withStocks){
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

  toListItemClicked(listItem: ListItem) :void {
    this.resetProductWindows();
    this.decideWhichFromListToLoad(listItem);
    this.toListSelected=listItem;
  }

  fromListItemClicked(listItem: ListItem): void {
    this.resetProductWindows();
    this.fromListSelected=listItem;
    this.loadAvailableArticles();
    this.loadOrderedArticles();
  }

  private loadAvailableArticles(): void {
    switch (this.fromListSelected.type) {
      case OrderableType.Stock: {
        this.api.readArticlesByStockArticleStockStockIdGet(this.fromListSelected.item.id).pipe(first()).subscribe((articles) => {
          this.availableProductsSubscriber.next(articles);
        });
        break;
      }
      case OrderableType.Job: {
        console.error("OrderComponent: an item with type JOB has been clicked in FROM list");
        break;
      }
      case OrderableType.Supplier: {
        this.api.readArticlesBySupplierArticleSupplierSupplierIdGet(this.fromListSelected.item.id).pipe(first()).subscribe((articles) => {
          this.availableProductsSubscriber.next(articles);
        });
        break;
      }
    }
  }


  private loadOrderedArticles(): void {
    this.api.readOrderFromToOrderFromOrderableFromIdToOrderableToIdGet(this.fromListSelected.item.orderable.id, this.toListSelected.item.orderable.id).pipe(first()).subscribe((order) => {
      this.lastOrderId = order.id;
      this.orderedProductsSubscriber.next(order.articles);
    });
  }

  private decideWhichFromListToLoad(listItem: ListItem): void {
    switch (listItem.type) {
      case OrderableType.Stock: {
        this.loadFromList(false);
        break;
      }
      case OrderableType.Job: {
        this.loadFromList(true);
        break;
      }
      case OrderableType.Supplier: {
        console.error("OrderComponent: an item with type SUPPLIER has been clicked in TO list");
        break;
      }
    }
  }

  private resetProductWindows(): void {
    if(this.availableProductsSubscriber !== undefined)
      this.availableProductsSubscriber.next([]);
    if(this.orderedProductsSubscriber !== undefined)
      this.orderedProductsSubscriber.next([]);
  }


  refreshOrderedProducts() : void {
    this.loadOrderedArticles();
  }

  refreshAvailableProducts() :void {
    this.loadAvailableArticles();
  }
}
