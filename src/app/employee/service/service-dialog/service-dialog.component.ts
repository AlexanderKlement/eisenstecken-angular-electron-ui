import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent,} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {DefaultService, Service, ServiceUpdate} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

export interface ServiceDialogData {
    id: number;
}

@Component({
    selector: 'app-service-dialog',
    templateUrl: './service-dialog.component.html',
    styleUrls: ['./service-dialog.component.scss']
})
export class ServiceDialogComponent implements OnInit {

    service: Service;
    minutes: number;
    loading = true;
    serviceGroup: FormGroup;

    constructor(public dialogRef: MatDialogRef<ServiceDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ServiceDialogData,
                private api: DefaultService, private snackBar: MatSnackBar,
                private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.api.readServiceServiceServiceIdGet(this.data.id).pipe(first()).subscribe((service) => {
            this.service = service;
            this.serviceGroup = new FormGroup({
                minutes: new FormControl(service.minutes)
            });
            this.loading = false;
        });
    }

    onNoClick() {
        this.dialogRef.close(false);
    }

    onYesClick() {
        const serviceUpdate: ServiceUpdate = {
            minutes: parseInt(this.getMinuteControl().value, 10),
        };
        const serviceId = this.service.id;
        this.api.updateServiceServiceServiceIdPost(serviceId, serviceUpdate).pipe(first()).subscribe(() => {
            this.dialogRef.close(true);
        });
    }

    onDeleteClick() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Service löschen?',
                text: 'Service löschen? Diese Aktion kann nicht rückgängig gemacht werden!'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.api.deleteServiceServiceServiceIdDelete(this.service.id).pipe(first()).subscribe(success => {
                    if (success) {
                        this.dialogRef.close(true);
                    } else {
                        this.snackBar.open('Service konnte nicht gelöscht werden', 'Ok', {
                            duration: 10000
                        });
                    }
                });

            }
        });
    }

    getMinuteControl(): FormControl {
        return this.serviceGroup.get('minutes') as FormControl;
    }
}
