import {DataSourceClass} from "../table-builder/table-builder.datasource";
import {Observable} from "rxjs";

export interface Mapping<T> {
  property: keyof T;
  name: string;
}

export class InfoDataSource<T extends DataSourceClass> {

  public data$: Observable<T>;
  public mapping: Mapping<T>[];

  constructor(data: Observable<T>, mapping: Mapping<T>[]) {
    this.data$ = data;
    this.mapping = mapping;
  }
}
