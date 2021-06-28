import {Observable} from "rxjs";
import {DataSourceClass, RecursiveKeyOf} from "../../types";

export interface Mapping<T> {
  property: RecursiveKeyOf<T>;
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
