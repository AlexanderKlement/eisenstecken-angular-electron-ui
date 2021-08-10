import { Component, OnInit } from '@angular/core';
import {Observable, Subscriber, combineLatest} from "rxjs";
import {
  ListItem,
  SupportedListElements
} from "../shared/components/filterable-clickable-list/filterable-clickable-list.types";
import {DefaultService, Job, OrderableType, Stock} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {


  toListName = "Bestelle für Aufträge oder Lager";
  toList$ : Observable<ListItem[]>; //Here go stocks and suppliers
  toListSubscriber: Subscriber<ListItem[]>;

  fromListName = "Bestelle von Lieferanten oder Lager";
  fromList$: Observable<ListItem[]>;
  fromListSubscriber: Subscriber<ListItem[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.toList$ = new Observable<ListItem[]>((toListSubscriber) => {
      this.toListSubscriber = toListSubscriber;
      this.loadToList();
    });
    this.fromList$ = new Observable<ListItem[]>((fromListSubscriber) => {
      this.fromListSubscriber = fromListSubscriber;
    });
  }

  private loadToList(){
    const stocks$ = this.api.readStocksStockGet();
    const jobs$ = this.api.readJobsJobGet(); //TODO: change this to only open jobs, otherwise the list gets way too populated

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
        name: elem.orderable.name, //TODO: change orderable name remotely to job.client.name + job.orderable.name
        item: elem,
        type: elem.orderable.type
      };
      listItems.push(listItem);
    }
    return listItems;
  }


  private loadFromList(withStocks: boolean) {
    const stocks$ = this.api.readStocksStockGet();
    const suppliers$ = this.api.readSuppliersSupplierGet();

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
    console.log(listItem);
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
        console.error("OrderComponent: an item with type SUPPLIER has been klicked in to list");
        break;
      }
    }
  }

  fromListItemClicked(listItem: ListItem): void {
  }



}
