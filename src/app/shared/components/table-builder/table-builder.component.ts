import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DataSourceClass, GeneralDataSource} from "./table-builder.datasource";
import {MatPaginator} from "@angular/material/paginator";
import {debounceTime, distinctUntilChanged, tap} from "rxjs/operators";
import {fromEvent} from "rxjs";

@Component({
  selector: 'app-table-builder',
  templateUrl: './table-builder.component.html',
  styleUrls: ['./table-builder.component.scss']
})
export class TableBuilderComponent<T extends DataSourceClass> implements OnInit, AfterViewInit {

  @Input() dataSource: GeneralDataSource<T>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('input') input: ElementRef;


  constructor() {
    console.log("hi");
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadDataPage();
        })
      )
      .subscribe();

    // on sort or paginate events, load a new page
    this.paginator.page
      .pipe(
        tap(() => this.loadDataPage())
      )
      .subscribe();
  }

  private loadDataPage() {
    this.dataSource.loadData(this.input.nativeElement.value, "", this.paginator.pageIndex, this.paginator.pageSize);
  }
}
