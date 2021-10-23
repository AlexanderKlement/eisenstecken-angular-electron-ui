import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DefaultService, User, WorkloadCreate} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';

export interface WorkHourEditDialogData {
    userId: number;
    jobId: number;
    minutes: number;
}

@Component({
    selector: 'app-work-hour-edit-dialog',
    templateUrl: './work-hour-edit-dialog.component.html',
    styleUrls: ['./work-hour-edit-dialog.component.scss']
})
export class WorkHourEditDialogComponent implements OnInit {

    hours = '';
    minutes = '';
    userId: number;
    jobId: number;
    create: boolean;
    users$: Observable<User[]>;
    selectedUserName$: Observable<string>;

    constructor(
        public dialogRef: MatDialogRef<WorkHourEditDialogComponent>, private api: DefaultService,
        @Inject(MAT_DIALOG_DATA) public data: WorkHourEditDialogData) {
    }

    ngOnInit(): void {
        this.create = this.data.userId <= 0;
        this.users$ = this.api.readUsersUsersGet();
        this.userId = this.data.userId;
        this.jobId = this.data.jobId;
        if (!this.create) {
            this.selectedUserName$ = this.api.readUserUsersUserIdGet(this.userId).pipe(map(
                user => user.fullname
            ));
            this.minutes = (this.data.minutes % 60).toString(10);
            this.hours = Math.floor(this.data.minutes / 60).toString(10);
        }
    }


    onNoClick(): void {
        this.dialogRef.close();
    }


    onSubmitClick() {
        const workload: WorkloadCreate = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            user_id: this.userId,
            minutes: parseInt(this.minutes, 10) + (60 * parseInt(this.hours, 10)),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_id: this.data.jobId,
        };
        this.api.setWorkloadWorkloadPost(workload).pipe(first()).subscribe(() => {
            this.closeDialog();
        });
    }


    closeDialog(): void {
        this.dialogRef.close({
            reload: true
        });
    }

}

