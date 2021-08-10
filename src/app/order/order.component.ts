import { Component, OnInit } from '@angular/core';
import {Observable, Subscriber, combineLatest} from "rxjs";
import {
  ListItem,
  SupportedListElements
} from "../shared/components/filterable-clickable-list/filterable-clickable-list.types";
import {DefaultService, Job} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {


  toListName = "Bestelle für Aufträge und Lager";
  toList$ : Observable<ListItem[]>; //Here go stocks and suppliers
  toListSubscriber: Subscriber<ListItem[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.toList$ = new Observable<ListItem[]>((toListSubscriber) => {
      this.toListSubscriber = toListSubscriber;
      this.loadToList();
    });
  }

  private loadToList(){
    const stocks$ = this.api.readStocksStockGet();
    const jobs$ = this.api.readJobsJobGet(); //TODO: change this to only open jobs, otherwise the list gets way too populated

    const jobStockArray: ListItem[] = [];

    combineLatest([stocks$, jobs$]).subscribe(([stocks, jobs]) => {
      for (const stock of stocks){ //TODO: maybe this could be asynchron to speed things up
        const listItem:ListItem = {
          name: stock.orderable.name,
          item: stock
        };
        jobStockArray.push(listItem);
      }
      for (const job of jobs){
        const listItem: ListItem = {
          name: job.client.name + " " + job.orderable.name, //TODO: change this to fullname, once this property is introduced in python
          item: job
        };
        jobStockArray.push(listItem);
      }
      this.toListSubscriber.next(jobStockArray);
    });
  }

  toListItemClicked(supportedListElements: SupportedListElements) :void {
    console.log(supportedListElements);
  }



}
