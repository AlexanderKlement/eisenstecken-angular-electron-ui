import { Component, OnInit, Input } from '@angular/core';
import {Observable, of} from "rxjs";
import {Article} from "eisenstecken-openapi-angular-library";
import {FormControl} from "@angular/forms";
import {debounceTime, startWith, switchMap} from "rxjs/operators";


@Component({
  selector: 'app-available-products-list',
  templateUrl: './available-products-list.component.html',
  styleUrls: ['./available-products-list.component.scss']
})
export class AvailableProductsListComponent implements OnInit {

  @Input() availableProducts$: Observable<Article[]>;
  @Input() name: string;

  search: FormControl;
  search$: Observable<Article[]>;
  articles: Article[];
  articleControl: FormControl;


  constructor() { }

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

  copyButtonClicked(article: Article) : void {

  }

  orderButtonClicked(article: Article) : void {

  }
}
