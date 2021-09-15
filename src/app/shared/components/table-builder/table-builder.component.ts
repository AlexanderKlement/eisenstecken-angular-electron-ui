import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableDataSource} from './table-builder.datasource';
import {MatPaginator} from '@angular/material/paginator';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {fromEvent, Subscription} from 'rxjs';
import {DataSourceClass} from '../../types';

@Component({
  selector: 'app-table-builder',
  templateUrl: './table-builder.component.html',
  styleUrls: ['./table-builder.component.scss']
})
export class TableBuilderComponent<T extends DataSourceClass> implements OnInit, AfterViewInit, OnDestroy {

  @Input() dataSource: TableDataSource<T>;
  @Input() title?: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('input') input: ElementRef;

  subscription: Subscription;


  constructor() {
  }

  ngOnInit(): void {
    this.subscription = new Subscription();
  }

  ngAfterViewInit(): void {
    this.subscription.add(fromEvent(this.input.nativeElement, 'keyup').pipe(debounceTime(150), distinctUntilChanged(), tap(() => {
      this.paginator.pageIndex = 0;
      this.loadDataPage();
    })).subscribe());

    this.subscription.add(this.paginator.page.pipe(tap(() => this.loadDataPage())).subscribe());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public rowClicked(route: VoidFunction): void {
    route();
  }

  private loadDataPage() {
    this.dataSource.loadData(this.input.nativeElement.value, '', this.paginator.pageIndex, this.paginator.pageSize);
  }
}
