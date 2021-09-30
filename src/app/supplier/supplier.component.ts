import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, Supplier} from 'eisenstecken-openapi-angular-library';
import {LockService} from '../shared/lock.service';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {Router} from '@angular/router';

@Component({
    selector: 'app-supplier',
    templateUrl: './supplier.component.html',
    styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
    supplierTableDataSource: TableDataSource<Supplier>;
    buttons: CustomButton[] = [
        {
            name: 'Neuer Lieferant',
            navigate: () => {
                this.router.navigateByUrl('supplier/edit/new');
            },
        }
    ];

    constructor(private api: DefaultService, private locker: LockService, private router: Router) {
    }

    ngOnInit(): void {
        this.initSupplierDataSource();
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
                                'name': dataSource.name
                            },
                            route: () => {
                                this.locker.getLockAndTryNavigate(
                                    this.api.islockedSupplierSupplierIslockedSupplierIdGet(dataSource.id),
                                    this.api.lockSupplierSupplierLockSupplierIdPost(dataSource.id),
                                    this.api.unlockSupplierSupplierUnlockSupplierIdPost(dataSource.id),
                                    'supplier/' + dataSource.id.toString()
                                );
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'name', headerName: 'Name'}
            ],
            (api) => api.countOutgoingInvoicesOutgoingInvoiceCountGet()
        );
        this.supplierTableDataSource.loadData();
    }


}
