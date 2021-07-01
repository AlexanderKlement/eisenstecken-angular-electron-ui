import {Observable} from "rxjs";
import {DataSourceClass, RecursiveKeyOf} from "../../types";
import {Lock, User} from "eisenstecken-openapi-angular-library";

export interface Mapping<T> {
  property: RecursiveKeyOf<T>;
  name: string;
}

export class InfoDataSource<T extends DataSourceClass> {

  public data$: Observable<T>;
  public mapping: Mapping<T>[];
  public editButtonFunction: VoidFunction;
  public user$: Observable<User>;
  public unlockFunction: VoidFunction;
  public islockedFunction: () => Observable<Lock>;
  public lockFunction: (VoidFunction) => void;

  constructor(data: Observable<T>, mapping: Mapping<T>[], editButtonFunction: VoidFunction, islockedFunction: () => Observable<Lock>, unlockFunction: VoidFunction, lockFunction: (VoidFunction) => void, user: Observable<User>) {
    this.data$ = data;
    this.mapping = mapping;
    this.editButtonFunction = editButtonFunction;
    this.islockedFunction = islockedFunction;
    this.user$ = user;
    this.unlockFunction = unlockFunction;
    this.lockFunction = lockFunction;
  }
}
