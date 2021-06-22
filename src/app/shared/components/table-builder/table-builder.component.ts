import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DataSourceClass, GeneralDataSource} from "./table-builder.datasource";
import {MatPaginator} from "@angular/material/paginator";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-table-builder',
  templateUrl: './table-builder.component.html',
  styleUrls: ['./table-builder.component.scss']
})
export class TableBuilderComponent<T extends DataSourceClass> implements OnInit, AfterViewInit {

  @Input() dataSource: GeneralDataSource<T>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor() {
    console.log("hi");
  }

  ngOnInit(): void {
    console.log("TableBuilder initilized");
    console.log(this.dataSource);
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        tap(() => this.loadDataPage())
      )
      .subscribe();
  }

  private loadDataPage() {
    this.dataSource.loadData("", "", this.paginator.pageIndex, this.paginator.pageSize);
  }
}
