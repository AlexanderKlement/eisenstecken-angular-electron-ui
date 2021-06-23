import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Calendar, Client, DefaultService, User} from "eisenstecken-openapi-angular-library";
import {catchError, finalize, map} from "rxjs/operators";

export type DataSourceClass = Client | User | Calendar;

export interface Column<T> {
  name: keyof T;
  sortable?: boolean;
  headerName: string;
  // TODO: add filtering target here
  // TODO: add header name
}

export interface Row<T> {
  values: T;
  route: VoidFunction;
}

export const defaultValues = {
  filter: "",
  sortDirection: "ASC",
  pageIndex: 1,
  pageSize: 25
};

export type LoadFunction<T> = (api: DefaultService, filter: string, sortDirection: string, pageIndex: number, pageSize: number) => Observable<T[]>;

export type ParseFunction<T extends DataSourceClass> = (dataSourceClasses: T[]) => Row<T>[];

export type AmountFunction = (api:DefaultService) => Observable<number>;

export class GeneralDataSource<T extends DataSourceClass> extends DataSource<Row<T>> {

  public readonly columns: Column<T>[];
  public readonly columnIdentifiers: string[];
  public readonly headerNames: string[];
  private readonly loadFunction: LoadFunction<T>;
  private readonly parseFunction: ParseFunction<T>;

  private dataSubject = new BehaviorSubject<Row<T>[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public amount$: Observable<number>;

  public pageSize = defaultValues.pageSize;


  constructor(private api: DefaultService, loadFunction: LoadFunction<T>, parseFunction: ParseFunction<T>, columns: Column<T>[], amountFunction: AmountFunction) {
    super();
    this.loadFunction = loadFunction;
    this.parseFunction = parseFunction;
    this.columns = columns;
    this.columnIdentifiers = this.columns.map((column) => column.name.toString());
    this.amount$ = amountFunction(api);
  }

  public connect(collectionViewer: CollectionViewer): Observable<Row<T>[]> {
    console.log("Connecting data source to table");
    return this.dataSubject.asObservable();
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.dataSubject.complete();
    this.loadingSubject.complete();
  }

  public loadData(filter?: string, sortDirection?: string, pageIndex?: number, pageSize?: number): void {

    this.loadingSubject.next(true);

    this.findData(filter || defaultValues.filter, sortDirection || defaultValues.sortDirection, pageIndex || defaultValues.pageIndex, pageSize || defaultValues.pageSize).pipe(
      catchError(() => of([])), // TODO implement error function
      finalize(() => this.loadingSubject.next(false)),
      map(row => this.parseFunction(row))
    ).subscribe(data => this.dataSubject.next(data));
  }

  private findData(filter: string, sortDirection: string, pageIndex: number, pageSize: number): Observable<T[]> {
    return this.loadFunction(this.api, filter, sortDirection, pageIndex, pageSize);
  }
}


