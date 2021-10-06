import {Component, OnInit} from '@angular/core';
import {DefaultService, Order, OrderBundle, OrderedArticle} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
    articleDataSource: TableDataSource<OrderedArticle>;
    infoDataSource: InfoDataSource<Order>;

    orderId: number;

    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.orderId = parseInt(params.id, 10);
            if (isNaN(this.orderId)) {
                console.error('Cannot parse given id');
                this.router.navigate(['supplier']);
                return;
            }
            this.initArticleDataSource();
            this.initInfoDataSource();
        });
    }

    private initInfoDataSource(): void {
        this.infoDataSource = new InfoDataSource<Order>(
            this.api.readOrdersOrderOrderIdGet(this.orderId),
            [
                {
                    property: 'order_from.name',
                    name: 'Lieferant'
                },
                {
                    property: 'order_to.name',
                    name: 'Empfänger'
                },
                {
                    property: 'create_date',
                    name: 'Erstelldatum'
                },
                {
                    property: 'user.fullname',
                    name: 'Bestellung versendet:'
                }
            ],
            '/order/' + this.orderId.toString(),
            undefined,
            undefined,
            undefined
        );

    }

    private initArticleDataSource(): void {
        this.articleDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrderedArticlesByOrderOrderedArticleOrderOrderIdGet(this.orderId, skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'article.name.translation_de': dataSource.article.name.translation_de,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'article.description.translation_de': dataSource.article.description.translation_de,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'article.unit.name.translation_de': dataSource.article.unit.name.translation_de,
                            },
                            route: () => {
                                //this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'article.name.translation_de', headerName: 'Name'},
                {name: 'article.description.translation_de', headerName: 'Beschreibung'},
                {name: 'article.unit.name.translation_de', headerName: 'Einheit'}
            ],
            (api) => api.readOrderedArticleCountByOrderOrderedArticleOrderOrderIdCountGet(this.orderId)
        );
        this.articleDataSource.loadData();
    }

}
