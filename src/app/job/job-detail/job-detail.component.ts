import {Component, OnInit, ViewChild} from '@angular/core';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {Job, DefaultService, JobStatus, Offer, OutgoingInvoice} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {LockService} from '../../shared/lock.service';

@Component({
    selector: 'app-job-detail',
    templateUrl: './job-detail.component.html',
    styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {

    @ViewChild(InfoBuilderComponent) child: InfoBuilderComponent<Job>;

    public infoDataSource: InfoDataSource<Job>;
    public selectedJobStatus: Observable<JobStatus>;
    public jobId: number;
    public isMainJob = true;

    buttonsMain = [
        {
            name: 'Bearbeiten',
            navigate: (): void => {
                this.child.editButtonClicked();
            }
        }, {
            name: 'Neues Angebot',
            navigate: (): void => {
                this.router.navigateByUrl('/offer/edit/new/' + this.jobId.toString());
            }
        }, {
            name: 'Neue Rechnung',
            navigate: (): void => {
                this.router.navigateByUrl('/outgoing_invoice/edit/new/' + this.jobId.toString());
            }
        },  {
            name: 'Neuer Unterauftrag',
            navigate: (): void => {
                this.router.navigateByUrl('/job/edit/new/' + this.jobId.toString() + '/sub');
            }
        }
    ];

    buttonsSub = [
        {
            name: 'Bearbeiten',
            navigate: (): void => {
                this.child.editButtonClicked();
            }
        }, {
            name: 'Neues Angebot',
            navigate: (): void => {
                this.router.navigateByUrl('/offer/edit/new/' + this.jobId.toString());
            }
        }, {
            name: 'Neue Rechnung',
            navigate: (): void => {
                this.router.navigateByUrl('/outgoing_invoice/edit/new/' + this.jobId.toString());
            }
        }
    ];


    offerDataSource: TableDataSource<Offer>;
    outgoingInvoiceDataSource: TableDataSource<OutgoingInvoice>;
    subJobDataSource: TableDataSource<Job>;

    constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute, private locker: LockService) {
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
            this.selectedJobStatus = this.api.readJobJobJobIdGet(id).pipe(map((job): JobStatus => job.status));
            this.api.readJobJobJobIdGet(this.jobId).pipe(first()).subscribe((job) => {
                this.isMainJob = job.is_main;
            });
            this.initOfferTable();
            this.initSubJobTable();
            this.initOutgoingInvoiceTable();
            this.initJobDetail(id);
        });
    }

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
                                'name': dataSource.name,
                                'client.name': dataSource.client.fullname,
                                description: dataSource.description
                            },
                            route: () => {
                                this.locker.getLockAndTryNavigate(
                                    this.api.islockedJobJobIslockedJobIdGet(dataSource.id),
                                    this.api.unlockJobJobUnlockJobIdPost(dataSource.id),
                                    this.api.lockJobJobLockJobIdPost(dataSource.id),
                                    'job/' + dataSource.id.toString()
                                );
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
                                this.locker.getLockAndTryNavigate(
                                    this.api.islockedOfferOfferIslockedOfferIdGet(dataSource.id),
                                    this.api.lockOfferOfferLockOfferIdPost(dataSource.id),
                                    this.api.lockOfferOfferUnlockOfferIdPost(dataSource.id),
                                    'offer/edit/' + dataSource.id.toString()
                                );
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

    //TODO: add text, to which mainjob this is (if subjob)
    //TODO: remove orderstatus change if subjob
    //TODO: change status of subjobs if mainjobstatus is changed

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
}
