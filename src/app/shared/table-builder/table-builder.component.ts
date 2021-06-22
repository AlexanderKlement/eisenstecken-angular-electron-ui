import {Component, Input, OnInit} from '@angular/core';
import {DataSourceClass, GeneralDataSource} from "./table-builder.datasource";

@Component({
  selector: 'app-table-builder',
  templateUrl: './table-builder.component.html',
  styleUrls: ['./table-builder.component.scss']
})
export class TableBuilderComponent<T extends DataSourceClass> implements OnInit {

  @Input() dataSource: GeneralDataSource<T>;

  constructor() { }

  ngOnInit(): void {

  }
}
