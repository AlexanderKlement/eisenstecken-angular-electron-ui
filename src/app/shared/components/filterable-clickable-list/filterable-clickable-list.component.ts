import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {Observable, of} from "rxjs";
import {ListItem} from "./filterable-clickable-list.types";
import {FormControl} from "@angular/forms";
import {debounceTime, startWith, switchMap} from "rxjs/operators";


@Component({
  selector: 'app-filterable-clickable-list',
  templateUrl: './filterable-clickable-list.component.html',
  styleUrls: ['./filterable-clickable-list.component.scss']
})
export class FilterableClickableListComponent implements OnInit {

  @Input() listElements$: Observable<ListItem[]>;
  @Input() name: string;
  @Output() onClickEventEmitter = new EventEmitter<ListItem>();

  loading = true;
  listElements : ListItem[];
  search: FormControl;
  listElementControl: FormControl;
  search$: Observable<ListItem[]>;

  constructor() { }

  ngOnInit(): void {
    this.listElements$.subscribe((listElements) => {
      this.listElements = listElements;
    });
    this.search = new FormControl();
    this.listElementControl = new FormControl();
    this.search$ = this.search.valueChanges.pipe(
      startWith(null), //TODO: replace this deprecated element => someday we'll have to update
      debounceTime(200),
      switchMap((filterString: string) => {
        if(!filterString){
          return of(this.listElements);
        }
        filterString = filterString.toLowerCase();
        return of(this.listElements.filter((element) => element.name.toLowerCase().indexOf(filterString) >= 0));
      }));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  selectionChange($event: any) :void {
    this.onClickEventEmitter.emit($event.value);
  }

}
