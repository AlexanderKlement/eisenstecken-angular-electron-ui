import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Stock, Supplier} from 'eisenstecken-openapi-angular-library';
import {LockService} from '../shared/lock.service';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {AuthService} from '../shared/auth.service';

@Component({
    selector: 'app-supplier',
    templateUrl: './supplier.component.html',
    styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
    supplierTableDataSource: TableDataSource<Supplier>;
    stockTableDataSource: TableDataSource<Stock>;
    buttons: CustomButton[] = [];
    suppliersReadAllowed = false;
    stocksReadAllowed = false;


    constructor(private api: DefaultService, private locker: LockService, private router: Router, private authService: AuthService) {
    }

    ngOnInit(): void {
        this.initSupplierDataSource();
        this.initStockDataSource();
    }

    private initSupplierDataSource(): void {
        this.supplierTableDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readSuppliersSupplierGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                name: dataSource.name
                            },
                            route: () => {
                                this.router.navigateByUrl('supplier/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'}
            ],
            (api) => api.readSupplierCountSupplierCountGet()
        );
        this.supplierTableDataSource.loadData();
        this.authService.currentUserHasRight('suppliers:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Neuer Lieferant',
                    navigate: () => {
                        this.router.navigateByUrl('supplier/edit/new');
                    },
                });
            }
        });
        this.authService.currentUserHasRight('stocks:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Neues Lager',
                    navigate: () => {
                        this.router.navigateByUrl('stock/edit/new');
                    },
                });
            }
        });
        this.authService.currentUserHasRight('stocks:all').pipe(first()).subscribe(allowed => {
            this.stocksReadAllowed = true;
        });
        this.authService.currentUserHasRight('suppliers:all').pipe(first()).subscribe(allowed => {
            this.suppliersReadAllowed = true;
        });
    }


    private initStockDataSource() {
        this.stockTableDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readStocksStockGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                name: dataSource.name
                            },
                            route: () => {
                                this.router.navigateByUrl('stock/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'}
            ],
            (api) => api.readStockCountStockCountGet()
        );
        this.stockTableDataSource.loadData();
    }
}
