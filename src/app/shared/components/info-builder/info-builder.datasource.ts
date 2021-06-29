import {Observable} from "rxjs";
import {DataSourceClass, RecursiveKeyOf} from "../../types";

export interface Mapping<T> {
  property: RecursiveKeyOf<T>;
  name: string;
}

export class InfoDataSource<T extends DataSourceClass> {

  public data$: Observable<T>;
  public mapping: Mapping<T>[];
  public editButtonFunction: VoidFunction;

  constructor(data: Observable<T>, mapping: Mapping<T>[], editButtonFunction: VoidFunction) {
    this.data$ = data;
    this.mapping = mapping;
    this.editButtonFunction = editButtonFunction;
  }
}
