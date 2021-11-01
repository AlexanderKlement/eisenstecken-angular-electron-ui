import {Component, OnInit, ViewChild} from '@angular/core';
import {Client, DefaultService, Job} from 'eisenstecken-openapi-angular-library';
import {InfoDataSource} from '../../shared/components/info-builder/info-builder.datasource';
import {ActivatedRoute, Router} from '@angular/router';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {InfoBuilderComponent} from '../../shared/components/info-builder/info-builder.component';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';
import {AuthService} from '../../shared/services/auth.service';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-client-detail',
    templateUrl: './client-detail.component.html',
    styleUrls: ['./client-detail.component.scss'],
})
export class ClientDetailComponent implements OnInit {

    @ViewChild(InfoBuilderComponent) child: InfoBuilderComponent<Client>;
    public infoDataSource: InfoDataSource<Client>;
    public tableDataSource: TableDataSource<Job>;
    public id: number;
    public buttons: CustomButton[] = [];
    jobsAvailable = false;

    constructor(private api: DefaultService, private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.id = parseInt(params.id, 10);
            if (isNaN(this.id)) {
                console.error('Cannot parse given id');
                this.router.navigate(['client']);
                return;
            }
            this.initInfoDataSource();
            this.initTableDataSource();
        });
        this.authService.currentUserHasRight('clients:modify').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Bearbeiten',
                    navigate: () => {
                        this.child.editButtonClicked();
                    }
                });
            }
        });
        this.authService.currentUserHasRight('jobs:create').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                        name: 'Neuer Auftrag',
                        navigate: (): void => {
                            this.router.navigateByUrl('/job/edit/new/' + this.id.toString());
                        }
                    }
                );
            }
        });
        this.authService.currentUserHasRight('jobs:all').pipe(first()).subscribe(allowed => {
            this.jobsAvailable = allowed;
        });
    }

    private initInfoDataSource() {
        this.infoDataSource = new InfoDataSource<Client>(
            this.api.readClientClientClientIdGet(this.id),
            [
                {
                    property: 'fullname',
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
                    name: 'tel'
                },
                {
                    property: 'tel2',
                    name: 'tel'
                },
                {
                    property: 'fiscal_code',
                    name: 'Steuernummer'
                },
                {
                    property: 'vat_number',
                    name: 'P. IVA'
                },
                {
                    property: 'codice_destinatario',
                    name: 'Empfängerkodex'
                },
                {
                    property: 'pec',
                    name: 'PEC'
                },
                {
                    property: 'language.name.translation',
                    name: 'Sprache'
                },
            ],
            '/client/edit/' + this.id.toString(),
            this.api.islockedClientClientIslockedClientIdGet(this.id),
            this.api.lockClientClientLockClientIdPost(this.id),
            this.api.unlockClientClientUnlockClientIdPost(this.id)
        );
    }

    private initTableDataSource() {
        this.tableDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readJobsJobGet(skip, limit, filter, this.id, undefined, true),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                id: dataSource.id,
                                name: dataSource.name,
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
                {name: 'description', headerName: 'Beschreibung'}
            ],
            (api) => api.readJobCountJobCountGet(undefined, true, this.id)
        );
        this.tableDataSource.loadData();
    }
}
