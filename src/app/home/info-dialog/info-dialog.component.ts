import {Component, OnInit} from '@angular/core';
import {Contact, DefaultService, Price, TechnicalData, User, Credential} from 'eisenstecken-openapi-angular-library';
import {TableDataSource} from '../../shared/components/table-builder/table-builder.datasource';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-info-dialog',
    templateUrl: './info-dialog.component.html',
    styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {
    userDataSource: TableDataSource<User>;
    contactDataSource: TableDataSource<Contact>;
    priceDataSource: TableDataSource<Price>;
    technicalDataDataSource: TableDataSource<TechnicalData>;
    credentialDataSource: TableDataSource<Credential>;

    constructor(private api: DefaultService, public dialogRef: MatDialogRef<InfoDialogComponent>) {
    }

    // TODO: add a parameter where they can add all they stuff they want and show it here

    ngOnInit():
        void {
        this.initUserDataSource();
        this.initContactDataSource();
        this.initPriceDataSource();
        this.initTechnicalDataDataSource();
        this.initCredentialDataSource();
    }

    initUserDataSource(): void {
        this.userDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readUsersUsersGet(skip, filter, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                fullname: dataSource.fullname,
                                email: dataSource.email,
                                tel: dataSource.tel,
                                handy: dataSource.handy,
                                // eslint-disable-next-line no-underscore-dangle
                                dial: dataSource.dial,
                            },
                            route: () => {
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'fullname', headerName: 'Name'},
                {name: 'email', headerName: 'Email'},
                {name: 'tel', headerName: 'Telefon'},
                {name: 'handy', headerName: 'Handy'},
                {name: 'dial', headerName: 'Kurzwahl'},
            ],
            (api) => api.readUserCountUsersEmployeeCountGet()
        );
        this.userDataSource.loadData();
    }

    initContactDataSource(): void {
        this.contactDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readContactsContactGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                tel: dataSource.tel,
                                mail: dataSource.mail,
                                note: dataSource.note,
                            },
                            route: () => {
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'mail', headerName: 'Email'},
                {name: 'tel', headerName: 'Telefon'},
                {name: 'note', headerName: 'Notiz'},
            ],
            (api) => api.readContactCountContactCountGet()
        );
        this.contactDataSource.loadData();
    }

    initPriceDataSource(): void {
        this.priceDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readPricesPriceGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                price: dataSource.price,
                                comment: dataSource.comment,
                            },
                            route: () => {
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'price', headerName: 'Preis'},
                {name: 'comment', headerName: 'Kommentar'},
            ],
            (api) => api.readPriceCountPriceCountGet()
        );
        this.priceDataSource.loadData();
    }

    initTechnicalDataDataSource(): void {
        this.technicalDataDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readTechnicalDatasTechnicalDataGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                height: dataSource.height,
                                width: dataSource.width,
                                length: dataSource.length,
                            },
                            route: () => {
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Name'},
                {name: 'height', headerName: 'Höhe'},
                {name: 'width', headerName: 'Breite'},
                {name: 'length', headerName: 'Länge'},
            ],
            (api) => api.readTechnicalDataCountTechnicalDataCountGet()
        );
        this.technicalDataDataSource.loadData();
    }

    initCredentialDataSource(): void {
        this.credentialDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) => api.readCredentialsCredentialGet(skip, limit, filter),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                name: dataSource.name,
                                username: dataSource.username,
                                password: dataSource.password,
                                url: dataSource.url,
                            },
                            route: () => {
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'name', headerName: 'Firma'},
                {name: 'username', headerName: 'Benutzername'},
                {name: 'password', headerName: 'Password'},
                {name: 'url', headerName: 'Link/Kommentar'},
            ],
            (api) => api.readCredentialCountCredentialCountGet()
        );
        this.credentialDataSource.loadData();
    }

    onCloseClick() {
        this.dialogRef.close();
    }
}
