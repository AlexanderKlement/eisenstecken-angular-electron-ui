import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {DefaultService, Order, OrderBundle, OrderBundleCreate, Supplier} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';
import {MatDialog} from '@angular/material/dialog';
import {OrderDateReturnData, OrderDialogComponent} from './order-dialog/order-dialog.component';
import {first, map} from 'rxjs/operators';
import * as moment from 'moment';

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
    orderedOrderDataSource: TableDataSource<OrderBundle>;
    deliveredOrderDataSource: TableDataSource<OrderBundle>;
    buttons: CustomButton[] = [
        {
            name: 'Bearbeiten',
            navigate: () => {
                this.child.editButtonClicked();
            }
        },
        {
            name: 'Bestellung(en) senden',
            navigate: () => {
                this.sendOrderButtonClicked();
            }
        }
    ];


    constructor(private api: DefaultService,
                private router: Router,
                private route: ActivatedRoute,
                public dialog: MatDialog) {
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
                api.readOrderBundleBySupplierOrderBundleSupplierSupplierIdGet(this.id, skip, limit, filter, 'DELIVERED'),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                create_date: moment(dataSource.create_date).format('LLLL'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                delivery_date: moment(dataSource.delivery_date).format('L')
                            },
                            route: () => {
                                this.router.navigateByUrl('/order_bundle/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'create_date', headerName: 'Bestelldatum'},
                {name: 'delivery_date', headerName: 'Lieferdatum'},
            ],
            (api) => api.readCountOfOrderBundleBySupplierAndStatusOrderBundleSupplierSupplierIdCountGet(supplierId, 'DELIVERED')
        );
        this.deliveredOrderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrderBundleBySupplierOrderBundleSupplierSupplierIdGet(this.id, skip, limit, filter, 'ORDERED'),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                create_date: moment(dataSource.create_date).format('LLLL'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                delivery_date: moment(dataSource.delivery_date).format('L')
                            },
                            route: () => {
                                this.router.navigateByUrl('/order_bundle/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'create_date', headerName: 'Bestelldatum'},
                {name: 'delivery_date', headerName: 'Lieferdatum'},
            ],
            (api) => api.readCountOfOrderBundleBySupplierAndStatusOrderBundleSupplierSupplierIdCountGet(supplierId, 'ORDERED')
        );
        this.createdOrderDataSource.loadData();
        this.orderedOrderDataSource.loadData();
        this.deliveredOrderDataSource.loadData();
    }

    private sendOrderButtonClicked(): void {
        const dialogRef = this.dialog.open(OrderDialogComponent, {
            width: '400px',
            data: {
                name: this.api.readSupplierSupplierSupplierIdGet(this.id).pipe(
                    map((supplier) => supplier.displayable_name)),
                orders: this.api.readOrdersOrderSupplierSupplierIdGet(this.id, 0, 1000, '', 'CREATED')
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.ordersToOrderSelected(result);
        });
    }

    private ordersToOrderSelected(orderDateReturnData: OrderDateReturnData): void {
        this.api.readSupplierSupplierSupplierIdGet(this.id).pipe(first()).subscribe((supplier) => {
            const orderBundle: OrderBundleCreate = {
                description: '',
                orders: orderDateReturnData.orders,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                delivery_date: orderDateReturnData.date,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                order_from_id: supplier.orderable.id
            };
            this.api.createOrderBundleOrderBundleOrderBundlePost(orderBundle).pipe(first()).subscribe(() => {
                window.location.reload();
            });
        });

    }
}
