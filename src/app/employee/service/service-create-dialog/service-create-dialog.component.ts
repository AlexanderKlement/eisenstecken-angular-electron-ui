import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA,  MatDialogRef} from '@angular/material/dialog';
import {DefaultService, ServiceCreate, User} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {formatDateTransport} from '../../../shared/date.util';

export interface ServiceCreateDialogData {
    userId: number;
}

@Component({
    selector: 'app-service-create-dialog',
    templateUrl: './service-create-dialog.component.html',
    styleUrls: ['./service-create-dialog.component.scss']
})
export class ServiceCreateDialogComponent implements OnInit {

    user: User;
    loading = true;
    serviceGroup: FormGroup;

    constructor(public dialogRef: MatDialogRef<ServiceCreateDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ServiceCreateDialogData,
                private api: DefaultService) {
    }

    ngOnInit(): void {
        this.api.readUserUsersUserIdGet(this.data.userId).pipe(first()).subscribe((user) => {
            this.user = user;
            this.serviceGroup = new FormGroup({
                minutes: new FormControl(0),
                date: new FormControl(new Date().toISOString())
            });
            this.loading = false;
        });
    }

    getDateControl(): FormControl {
        return this.serviceGroup.get('date') as FormControl;
    }

    getMinuteControl(): FormControl {
        return this.serviceGroup.get('minutes') as FormControl;
    }

    onNoClick() {
        this.dialogRef.close(false);
    }

    onYesClick() {
        const serviceCreate: ServiceCreate = {
            minutes: parseInt(this.getMinuteControl().value, 10),
            date: formatDateTransport(this.getDateControl().value),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            user_id: this.user.id
        };
        this.api.createServiceServicePost(serviceCreate).pipe(first()).subscribe(() => {
            this.dialogRef.close(true);
        });
    }
}
