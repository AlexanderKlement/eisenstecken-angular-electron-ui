import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {DefaultService, IngoingInvoice} from 'eisenstecken-openapi-angular-library';
import {LockService} from '../../shared/lock.service';

@Component({
    selector: 'app-ingoing',
    templateUrl: './ingoing.component.html',
    styleUrls: ['./ingoing.component.scss']
})
export class IngoingComponent implements OnInit {

    ingoingInvoiceDataSource: TableDataSource<IngoingInvoice>;

    constructor(private api: DefaultService, private locker: LockService) {
    }

    ngOnInit(): void {
        this.initIngoingInvoiceDataSource();
    }

    private initIngoingInvoiceDataSource(): void {
        this.ingoingInvoiceDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readIngoingInvoicesIngoingInvoiceGet(skip, limit, filter),
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
                                    this.api.islockedIngoingInvoiceIngoingInvoiceIslockedIngoingInvoiceIdGet(dataSource.id),
                                    this.api.lockIngoingInvoiceIngoingInvoiceLockIngoingInvoiceIdPost(dataSource.id),
                                    this.api.unlockIngoingInvoiceIngoingInvoiceUnlockIngoingInvoiceIdPost(dataSource.id),
                                    'ingoing_invoice/edit/' + dataSource.id.toString()
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
            (api) => api.countIngoingInvoicesIngoingInvoiceCountGet()
        );
        this.ingoingInvoiceDataSource.loadData();
    }
}
