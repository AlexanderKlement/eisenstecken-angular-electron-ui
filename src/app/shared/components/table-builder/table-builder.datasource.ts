import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {catchError, finalize, map} from 'rxjs/operators';
import {DataSourceClass, RecursiveKeyOf} from '../../types';
import {MatPaginatorIntl} from '@angular/material/paginator';

export interface Column<T> {
    name: RecursiveKeyOf<T>;
    sortable?: boolean;
    headerName: string;
}

export interface Row<T> {
    values: T;
    route: VoidFunction;
}

export const defaultValues = {
    filter: '',
    sortDirection: 'ASC',
    pageIndex: 1,
    pageSize: 25,
    pageSizeOptions: [
        25,
        50,
        100
    ]
};

export interface TableButton<T> {
    name: string;
    onClick: (arg0: T) => void;
}

const germanRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `0 von ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} von ${length}`;
};

export function getGermanPaginatorIntl() {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = 'Elemente pro Seite:';
    paginatorIntl.nextPageLabel = 'Nächste Seite';
    paginatorIntl.previousPageLabel = 'Vorherige Seite';
    paginatorIntl.getRangeLabel = germanRangeLabel;

    return paginatorIntl;
}

export type LoadFunction<T> = (api: DefaultService, filter: string, sortDirection: string, skip: number, limit: number) => Observable<T[]>;

export type ParseFunction<T extends DataSourceClass> = (dataSourceClasses: T[]) => Row<T>[];

export type AmountFunction = (api: DefaultService) => Observable<number>;

export class TableDataSource<T extends DataSourceClass> extends DataSource<Row<T>> {

    public readonly columns: Column<T>[];
    public readonly columnIdentifiers: string[];
    public amount$: Observable<number>;
    public pageSize = defaultValues.pageSize;
    public pageSizeOptions = defaultValues.pageSizeOptions;
    public buttonList: TableButton<T>[];
    private loadingSubject = new BehaviorSubject<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public loading$ = this.loadingSubject.asObservable();
    private readonly loadFunction: LoadFunction<T>;
    private readonly parseFunction: ParseFunction<T>;
    private dataSubject = new BehaviorSubject<Row<T>[]>([]);

    constructor(private api: DefaultService,
                loadFunction: LoadFunction<T>,
                parseFunction: ParseFunction<T>,
                columns: Column<T>[],
                amountFunction: AmountFunction,
                buttonList: TableButton<T>[] = []) {
        super();
        this.loadFunction = loadFunction;
        this.parseFunction = parseFunction;
        this.columns = columns;
        this.columnIdentifiers = this.columns.map((column) => column.name.toString());
        this.amount$ = amountFunction(api);
        this.buttonList = buttonList;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public connect(collectionViewer: CollectionViewer): Observable<Row<T>[]> {
        return this.dataSubject.asObservable();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    public loadData(filter?: string, sortDirection?: string, pageIndex?: number, pageSize?: number): void {

        this.loadingSubject.next(true);

        this.findData(filter || defaultValues.filter,
            sortDirection || defaultValues.sortDirection,
            pageIndex || defaultValues.pageIndex,
            pageSize || defaultValues.pageSize).pipe(
            catchError(() => of([])), // TODO implement error function
            finalize(() => this.loadingSubject.next(false)),
            map(row => this.parseFunction(row))
        ).subscribe(data => this.dataSubject.next(data));
    }

    private findData(filter: string, sortDirection: string, pageIndex: number, pageSize: number): Observable<T[]> {
        const skip = pageSize * (pageIndex - 1);
        const limit = pageSize * pageIndex;
        return this.loadFunction(this.api, filter, sortDirection, skip, limit);
    }
}


