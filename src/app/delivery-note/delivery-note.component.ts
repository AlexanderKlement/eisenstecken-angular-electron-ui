import {Component, OnInit} from '@angular/core';
import {TableDataSource} from '../shared/components/table-builder/table-builder.datasource';
import {DefaultService, DeliveryNote} from 'eisenstecken-openapi-angular-library';
import * as moment from 'moment';
import {Router} from '@angular/router';
import {LockService} from '../shared/lock.service';
import {CustomButton} from '../shared/components/toolbar/toolbar.component';
import {AuthService} from '../shared/auth.service';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-delivery-note',
    templateUrl: './delivery-note.component.html',
    styleUrls: ['./delivery-note.component.scss']
})
export class DeliveryNoteComponent implements OnInit {
    buttons: CustomButton[] = [];
    deliveryNoteDataSource: TableDataSource<DeliveryNote>;

    constructor(private api: DefaultService, private locker: LockService, private router: Router, private authService: AuthService) {
    }

    ngOnInit(): void {
        this.initDeliveryNotes();
        this.authService.currentUserHasRight('delivery_notes:modify').pipe(first()).subscribe(allowed => {
            if (allowed) {
                this.buttons.push({
                    name: 'Neuer Lieferschein',
                    navigate: () => {
                        this.router.navigateByUrl('delivery_note/new');
                    }
                });
            }
        });
    }

    private initDeliveryNotes(): void {
        this.deliveryNoteDataSource = new TableDataSource(
            this.api,
            (api, filter, sortDirection, skip, limit) =>
                api.readDeliveryNotesDeliveryNoteGet(skip, limit),
            (dataSourceClasses) => {
                const rows = [];
                dataSourceClasses.forEach((dataSource) => {
                    rows.push(
                        {
                            values: {
                                free: dataSource.number,
                                date: moment(dataSource.date).format('L'),
                                name: dataSource.name,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                delivery_address: dataSource.delivery_address,
                            },
                            route: () => {
                                this.authService.currentUserHasRight('delivery_notes:modify').pipe(first()).subscribe(allowed => {
                                    if (allowed) {
                                        this.locker.getLockAndTryNavigate(
                                            this.api.islockedDeliveryNoteDeliveryNoteIslockedDeliveryNoteIdGet(dataSource.id),
                                            this.api.lockDeliveryNoteDeliveryNoteLockDeliveryNoteIdPost(dataSource.id),
                                            this.api.unlockDeliveryNoteDeliveryNoteUnlockDeliveryNoteIdPost(dataSource.id),
                                            'delivery_note/' + dataSource.id.toString()
                                        );
                                    }
                                });
                            }
                        });
                });
                return rows;
            },
            [
                {name: 'free', headerName: 'Nummer'},
                {name: 'date', headerName: 'Datum'},
                {name: 'name', headerName: 'Empfänger'},
                {name: 'delivery_address', headerName: 'Adresse'},
            ],
            (api) => api.readDeliveryNoteCountDeliveryNoteCountGet()
        );
        this.deliveryNoteDataSource.loadData();
    }
}
