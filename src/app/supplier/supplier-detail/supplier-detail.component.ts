import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {DefaultService, Order, Supplier} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';

@Component({
    selector: 'app-supplier-detail',
    templateUrl: './supplier-detail.component.html',
    styleUrls: ['./supplier-detail.component.scss']
})
export class SupplierDetailComponent implements OnInit {

    @ViewChild(InfoBuilderComponent) child: InfoBuilderComponent<Supplier>;
    public infoDataSource: InfoDataSource<Supplier>;
    public id: number;
    createdOrderDataSource: TableDataSource<Order>;
    orderedOrderDataSource: TableDataSource<Order>;
    deliveredOrderDataSource: TableDataSource<Order>;
    buttons: CustomButton[] = [
        {
            name: 'Bearbeiten',
            navigate: () => {
                this.child.editButtonClicked();
            },
        }
    ];


    constructor(private api: DefaultService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            try {
                this.id = parseInt(params.id, 10);
            } catch {
                console.error('Cannot parse given id');
                this.router.navigateByUrl('supplier');
                return;
            }
            this.initSupplierDetail(this.id);
            this.initOrderTable(this.id);
        });

    }

    private initSupplierDetail(id: number): void {
        this.infoDataSource = new InfoDataSource<Supplier>(
            this.api.readSupplierSupplierSupplierIdGet(id),
            [
                {
                    property: 'orderable.name',
                    name: 'Name'
                },
                {
                    property: 'mail1',
                    name: 'Mail'
                },
                {
                    property: 'mail2',
                    name: 'Mail'
                },
                {
                    property: 'tel1',
                    name: 'Telefon'
                },
                {
                    property: 'tel2',
                    name: 'Telefon'
                },
                {
                    property: 'address.street_number',
                    name: 'Adresse'
                },
                {
                    property: 'address.city',
                    name: 'Gemeinde'
                }
            ],
            '/supplier/edit/' + this.id.toString(),
            this.api.islockedSupplierSupplierIslockedSupplierIdGet(this.id),
            this.api.lockSupplierSupplierLockSupplierIdPost(this.id),
            this.api.unlockSupplierSupplierUnlockSupplierIdPost(this.id)
        );
    }

    private initOrderTable(supplierId: number): void {
        this.createdOrderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersOrderSupplierSupplierIdGet(this.id, skip, limit, filter, 'CREATED'),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.name': dataSource.order_to.name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                description: dataSource.description
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'order_to.name', headerName: 'Ziel'},
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readOrderCountOrderSupplierSupplierIdCountGet(supplierId, 'CREATED')
        );
        this.orderedOrderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersOrderSupplierSupplierIdGet(this.id, skip, limit, filter, 'DELIVERED'),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.name': dataSource.order_to.name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                description: dataSource.description
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'order_to.name', headerName: 'Ziel'},
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readOrderCountOrderSupplierSupplierIdCountGet(supplierId, 'DELIVERED')
        );
        this.deliveredOrderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersOrderSupplierSupplierIdGet(this.id, skip, limit, filter, 'ORDERED'),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.name': dataSource.order_to.name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                description: dataSource.description
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'order_to.name', headerName: 'Ziel'},
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readOrderCountOrderSupplierSupplierIdCountGet(supplierId, 'ORDERED')
        );
        this.createdOrderDataSource.loadData();
        this.orderedOrderDataSource.loadData();
        this.deliveredOrderDataSource.loadData();
    }
}
