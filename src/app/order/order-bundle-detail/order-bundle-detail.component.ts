import {Component, OnInit} from '@angular/core';
import {TableBuilderComponent} from '../../shared/components/table-builder/table-builder.component';
import {DefaultService, Order, OrderBundle, Supplier} from 'eisenstecken-openapi-angular-library';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-order-bundle-detail',
    templateUrl: './order-bundle-detail.component.html',
    styleUrls: ['./order-bundle-detail.component.scss']
})
export class OrderBundleDetailComponent implements OnInit {
    orderDataSource: TableDataSource<Order>;
    infoDataSource: InfoDataSource<OrderBundle>;

    orderBundleId: number;

    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.orderBundleId = parseInt(params.id, 10);
            if (isNaN(this.orderBundleId)) {
                console.error('Cannot parse given id');
                this.router.navigate(['supplier']);
                return;
            }
            this.initOrderDataSource();
            this.initInfoDataSource();
        });
    }

    private initInfoDataSource(): void {
        this.infoDataSource = new InfoDataSource<OrderBundle>(
            this.api.readOrderBundleOrderBundleOrderBundleIdGet(this.orderBundleId),
            [
                {
                    property: 'order_from.name',
                    name: 'Name'
                },
                {
                    property: 'create_date',
                    name: 'Erstelldatum'
                },
                {
                    property: 'delivery_date',
                    name: 'Bestelldatum'
                }
            ],
            '/order/' + this.orderBundleId.toString(),
            undefined,
            undefined,
            undefined
        );

    }

    private initOrderDataSource(): void {
        this.orderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersByOrderBundleOrderBundleOrdersOrderBundleIdGet(this.orderBundleId, skip, limit, filter),
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
            (api) => api.readOrdersByOrderBundleOrderBundleOrdersOrderBundleIdCountGet(this.orderBundleId)
        );
    }
}
