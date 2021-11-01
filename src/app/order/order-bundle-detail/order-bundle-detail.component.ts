import {Component, OnInit} from '@angular/core';
import {TableBuilderComponent} from '../../shared/components/table-builder/table-builder.component';
import {DefaultService, Order, OrderBundle, Supplier} from 'eisenstecken-openapi-angular-library';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {ActivatedRoute, Router} from '@angular/router';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {first} from 'rxjs/operators';
import {LockService} from '../../shared/services/lock.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-order-bundle-detail',
    templateUrl: './order-bundle-detail.component.html',
    styleUrls: ['./order-bundle-detail.component.scss']
})
export class OrderBundleDetailComponent implements OnInit {
    orderDataSource: TableDataSource<Order>;
    infoDataSource: InfoDataSource<OrderBundle>;

    orderBundleId: number;

    buttons: CustomButton[] = [
        {
            name: 'Preise eintragen',
            navigate: (): void => {
                this.locker.getLockAndTryNavigate(
                    this.api.islockedOrderBundleOrderBundleIslockedOrderBundleIdGet(this.orderBundleId),
                    this.api.lockOrderBundleOrderBundleLockOrderBundleIdPost(this.orderBundleId),
                    this.api.unlockOrderBundleOrderBundleUnlockOrderBundleIdPost(this.orderBundleId),
                    'order_bundle/edit/' + this.orderBundleId.toString()
                );
            }
        },
        {
            name: 'Löschen',
            navigate: (): void => {
                this.orderDeleteClicked();
            }
        },
    ];


    constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router,
                public dialog: MatDialog, private locker: LockService, private snackBar: MatSnackBar) {

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

    orderDeleteClicked(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Versendete Bestellung löschen?',
                text: 'Versendete Besellung wirklich löschen? Die einzelnen Artikel können' +
                    ' danach wieder im Bestellung-Fenster bearbeitet werden.'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.api.deleteOrderBundleOrderBundleOrderBundleIdDelete(this.orderBundleId).pipe(first()).subscribe(success => {
                    if (success) {
                        this.orderDataSource.loadData();
                    } else {
                        this.snackBar.open('Bestellung konnte nicht aufgelöst werden', 'Ok',{
                          duration: 10000
                        });
                        console.error('Could not delete order bundle');
                    }
                });

            }
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
                },
                {
                    property: 'user.fullname',
                    name: 'Bestellung versendet:'
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
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.name': dataSource.order_to.name,
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'order_to.name', headerName: 'Ziel'}
            ],
            (api) => api.readOrdersByOrderBundleOrderBundleOrdersOrderBundleIdCountGet(this.orderBundleId)
        );
        this.orderDataSource.loadData();
    }
}
