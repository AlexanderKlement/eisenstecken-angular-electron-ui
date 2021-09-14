import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {DefaultService, OutgoingInvoice} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';
import {LockService} from '../../shared/lock.service';

@Component({
    selector: 'app-outgoing',
    templateUrl: './outgoing.component.html',
    styleUrls: ['./outgoing.component.scss']
})
export class OutgoingComponent implements OnInit {

    outgoingInvoiceDataSource: TableDataSource<OutgoingInvoice>;

    constructor(private api: DefaultService, private locker: LockService) {
    }

    ngOnInit(): void {
        this.initOutgoingInvoiceDataSource();
    }

    private initOutgoingInvoiceDataSource(): void {
        this.outgoingInvoiceDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOutgoingInvoicesOutgoingInvoiceGet(skip, filter, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                date: dataSource.number,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                full_price_with_vat: dataSource.date
                            },
                            route: () => {
                                this.locker.getLockAndTryNavigate(
                                    this.api.islockedOutgoingInvoiceOutgoingInvoiceIslockedOutgoingInvoiceIdGet(dataSource.id),
                                    this.api.lockOutgoingInvoiceOutgoingInvoiceLockOutgoingInvoiceIdPost(dataSource.id),
                                    this.api.unlockOutgoingInvoiceOutgoingInvoiceUnlockOutgoingInvoiceIdPost(dataSource.id),
                                    'outgoing_invoice/edit/' + dataSource.id.toString()
                                );
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'number', headerName: 'Nummer'},
                {name: 'date', headerName: 'Datum'}
            ],
            (api) => api.countOutgoingInvoicesOutgoingInvoiceCountGet()
        );
        this.outgoingInvoiceDataSource.loadData();
    }

}
