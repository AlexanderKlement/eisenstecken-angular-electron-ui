import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {Job, DefaultService, Offer, OutgoingInvoice, Order} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';
import {first} from 'rxjs/operators';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {LockService} from '../../shared/lock.service';
import * as moment from 'moment';
import {AuthService} from '../../shared/auth.service';
import {ConfirmDialogComponent} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-job-detail',
    templateUrl: './job-detail.component.html',
    styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

    @ViewChild(InfoBuilderComponent) child: InfoBuilderComponent<Job>;

    public infoDataSource: InfoDataSource<Job>;
    public jobId: number;
    public isMainJob = true;

    buttonsMain = [];

    buttonsSub = [];


    offerDataSource: TableDataSource<Offer>;
    outgoingInvoiceDataSource: TableDataSource<OutgoingInvoice>;
    subJobDataSource: TableDataSource<Job>;
    orderDataSource: TableDataSource<Order>;
    ordersAllowed = false;
    outgoingInvoicesAllowed = false;
    offersAllowed = false;

    constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar,
                private locker: LockService, private authService: AuthService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            let id: number;

            try {
                id = parseInt(params.id, 10);
            } catch {
                console.error('Cannot parse given id');
                this.router.navigate(['Job']);
                return;
            }
            this.jobId = id;
            this.api.readJobJobJobIdGet(this.jobId).pipe(first()).subscribe((job) => {
                this.isMainJob = job.is_main;

            });
            this.initOfferTable();
            this.initSubJobTable();
            this.initOutgoingInvoiceTable();
            this.initJobDetail(id);
            this.initOrderTable();
        });
        this.initAccessRights();
    }

    //TODO: add text, to which mainjob this is (if subjob)
    //TODO: remove orderstatus change if subjob

    initSubJobTable() {
        this.subJobDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readSubjobsByJobJobSubjobByJobJobIdGet(this.jobId, filter, skip, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                'client.name': dataSource.client.fullname,
                                description: dataSource.description
                            },
                            route: () => {
                                this.router.navigateByUrl('/job/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'client.name', headerName: 'Kunde'},
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readSubjobCountByJobJobSubjobCountByJobJobIdGet(this.jobId)
        );
        this.subJobDataSource.loadData();
    }

    initOfferTable() {
        this.offerDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readOffersByJobOfferJobJobIdGet(this.jobId, filter, skip, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                date: dataSource.date,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                full_price_with_vat: dataSource.full_price_with_vat
                            },
                            route: () => {
                                this.authService.currentUserHasRight('offers:modify').pipe(first()).subscribe(allowed => {
                                    if (allowed) {
                                        this.locker.getLockAndTryNavigate(
                                            this.api.islockedOfferOfferIslockedOfferIdGet(dataSource.id),
                                            this.api.lockOfferOfferLockOfferIdPost(dataSource.id),
                                            this.api.lockOfferOfferUnlockOfferIdPost(dataSource.id),
                                            'offer/edit/' + dataSource.id.toString()
                                        );
                                    }
                                });
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'id', headerName: 'ID'},
                {name: 'date', headerName: 'Datum'},
                {name: 'full_price_with_vat', headerName: 'Preis'}
            ],
            (api) => api.countOffersByJobOfferJobCountJobIdGet(this.jobId)
        );
        this.offerDataSource.loadData();
    }

    initOutgoingInvoiceTable() {
        this.outgoingInvoiceDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOutgoingInvoicesByJobOutgoingInvoiceJobJobIdGet(this.jobId, filter, skip, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                date: dataSource.date,
                                // eslint-disable-next-line id-blacklist
                                number: dataSource.number
                            },
                            route: () => {
                                this.authService.currentUserHasRight('outgoing_invoices:modify').pipe(first()).subscribe(allowed => {
                                    if (allowed) {
                                        this.locker.getLockAndTryNavigate(
                                            this.api.islockedOutgoingInvoiceOutgoingInvoiceIslockedOutgoingInvoiceIdGet(dataSource.id),
                                            this.api.lockOutgoingInvoiceOutgoingInvoiceLockOutgoingInvoiceIdPost(dataSource.id),
                                            this.api.unlockOutgoingInvoiceOutgoingInvoiceUnlockOutgoingInvoiceIdPost(dataSource.id),
                                            'outgoing_invoice/edit/' + dataSource.id.toString()
                                        );
                                    }
                                });

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
            (api) => api.countOutgoingInvoicesByJobOutgoingInvoiceJobCountJobIdGet(this.jobId)
        );
        this.outgoingInvoiceDataSource.loadData();
    }

    initJobDetail(id: number) {
        this.infoDataSource = new InfoDataSource<Job>(
            this.api.readJobJobJobIdGet(id),
            [
                {
                    property: 'name',
                    name: 'Name'
                },
                {
                    property: 'description',
                    name: 'Beschreibung'
                },
                {
                    property: 'year',
                    name: 'Jahr'
                },
                {
                    property: 'client.fullname',
                    name: 'Kunde'
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
            '/job/edit/' + this.jobId.toString(),
            this.api.islockedJobJobIslockedJobIdGet(this.jobId),
            this.api.lockJobJobLockJobIdPost(this.jobId),
            this.api.unlockJobJobUnlockJobIdPost(this.jobId)
        );
    }

    private initOrderTable(): void {
        this.orderDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readOrdersToOrderToOrderableToIdGet(this.jobId, skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_to.displayable_name': dataSource.order_to.displayable_name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'order_from.displayable_name': dataSource.order_from.displayable_name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                create_date: moment(dataSource.create_date).format('L'),
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                delivery_date: dataSource.delivery_date === null ? '' : moment(dataSource.delivery_date).format('L'),
                                status: dataSource.status_translation,
                            },
                            route: () => {
                                this.router.navigateByUrl('/order/' + dataSource.id.toString());
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'order_to.displayable_name', headerName: 'Ziel'},
                {name: 'order_from.displayable_name', headerName: 'Herkunft'},
                {name: 'create_date', headerName: 'Erstelldatum'},
                {name: 'delivery_date', headerName: 'Lieferdatum'},
                {name: 'status', headerName: 'Status'},
            ],
            (api) => api.readOrdersToCountOrderToOrderableToIdCountGet(this.jobId)
        );
        this.orderDataSource.loadData();
    }

    private initAccessRights() {
        this.authService.currentUserHasRight('orders:all').pipe(first()).subscribe(allowed => {
            this.ordersAllowed = allowed;
        });
        this.authService.currentUserHasRight('offers:all').pipe(first()).subscribe(allowed => {
            this.offersAllowed = allowed;
        });
        this.authService.currentUserHasRight('outgoing_invoices:all').pipe(first()).subscribe(allowed => {
            this.outgoingInvoicesAllowed = allowed;
        });

        this.authService.currentUserHasRight('jobs:modify').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Bearbeiten',
                    navigate: (): void => {
                        this.child.editButtonClicked();
                    }
                });
                this.buttonsSub.push({
                    name: 'Bearbeiten',
                    navigate: (): void => {
                        this.child.editButtonClicked();
                    }
                });
            }
        });

        this.authService.currentUserHasRight('offers:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Neues Angebot',
                    navigate: (): void => {
                        this.router.navigateByUrl('/offer/edit/new/' + this.jobId.toString());
                    }
                });
            }
        });

        this.authService.currentUserHasRight('outgoing_invoices:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Neue Rechnung',
                    navigate: (): void => {
                        this.router.navigateByUrl('/outgoing_invoice/edit/new/' + this.jobId.toString());
                    }
                });
            }
        });

        this.authService.currentUserHasRight('work_hours:all').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Stunden',
                    navigate: (): void => {
                        this.router.navigateByUrl('/work_hours/' + this.jobId.toString());
                    }
                });
            }
        });


        this.authService.currentUserHasRight('work_hours:all').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Neuer Unterauftrag',
                    navigate: (): void => {
                        this.router.navigateByUrl('/job/edit/new/' + this.jobId.toString() + '/sub');
                    }
                });
            }
        });

        this.authService.currentUserHasRight('jobs:delete').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttonsMain.push({
                    name: 'Auftrag löschen',
                    navigate: (): void => {
                        this.jobDeleteClicked();
                    }
                });
            }
        });
    }

    private jobDeleteClicked(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Auftrag löschen?',
                text: 'Auftrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const secondDialogRef = this.dialog.open(ConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        title: 'Auftrag löschen?',
                        text: 'Sind Sie sich sicher?'
                    }
                });
                secondDialogRef.afterClosed().subscribe(secondResult => {
                    if (secondResult) {
                        this.api.deleteJobJobJobIdDelete(this.jobId).pipe(first()).subscribe(success => {
                            if (success) {
                                this.router.navigateByUrl('job');
                            } else {
                                this.snackBar.open('Der Auftrag konnte leider nicht gelöscht werden.'
                                    , 'Ok');
                            }
                        });
                    }
                });
            }
        });
    }
}
