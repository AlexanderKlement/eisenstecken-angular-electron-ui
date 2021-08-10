import { Component, OnInit, Input } from '@angular/core';
import {Observable} from "rxjs";
import {Article} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-available-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  @Input() products$: Observable<Article>;

  constructor() { }

  ngOnInit(): void {
  }

}
