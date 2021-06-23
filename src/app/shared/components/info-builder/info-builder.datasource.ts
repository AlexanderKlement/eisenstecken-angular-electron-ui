import {DataSourceClass} from "../table-builder/table-builder.datasource";
import {Observable} from "rxjs";

export interface Mapping<T> {
  property: keyof T;
  name: string;
}

export class InfoDataSource<T extends DataSourceClass> {

  public data$: Observable<T>;
  public mapping: Mapping<T>[];
  public numberOfRows: number;

  constructor(data: Observable<T>, mapping: Mapping<T>[], rows: number) {
    console.log(data);
    console.log(mapping);
    console.log(rows);
    this.data$ = data;
    this.mapping = mapping;
    this.numberOfRows = rows;
  }
}
