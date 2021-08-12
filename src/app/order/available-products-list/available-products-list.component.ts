import { Component, OnInit, Input } from '@angular/core';
import {Observable} from "rxjs";
import {Article} from "eisenstecken-openapi-angular-library";
import {FormControl} from "@angular/forms";


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


  constructor() { }

  ngOnInit(): void {

  }

}
