import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DefaultService, User, Workload, WorkloadCreate, WorkloadUpdate} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';

export interface WorkHourEditDialogData {
    jobId: number;
    userId: number;
}

@Component({
    selector: 'app-work-hour-edit-dialog',
    templateUrl: './work-hour-edit-dialog.component.html',
    styleUrls: ['./work-hour-edit-dialog.component.scss']
})
export class WorkHourEditDialogComponent implements OnInit {

    create: boolean;
    userId: number;
    jobId: number;
    workloadId: number;
    users$: Observable<User[]>;
    selectedUserName$: Observable<string>;
    workHourGroup: FormGroup;
    loading = true;

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
            this.api.readWorkloadByUserAndJobWorkloadUserJobUserIdJobIdGet(this.userId, this.jobId).pipe(first()).subscribe((workload) => {
                this.initWorkHourGroup(workload);
                this.workloadId = workload.id;
                this.loading = false;
            });
        } else {
            this.initWorkHourGroup();
            this.loading = false;
        }
    }

    initWorkHourGroup(workload?: Workload): void {
        let minutes = 0;
        let minutesDirection = 0;
        if (workload) {
            minutes = workload.minutes;
            minutesDirection = workload.minutes_direction;
        }
        this.workHourGroup = new FormGroup({
            minutes: new FormControl(minutes),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            minutes_direction: new FormControl(minutesDirection),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            selected_user_id: new FormControl(this.create ? 1 : this.userId),
        });
    }


    onNoClick(): void {
        this.closeDialog(false);
    }

    getMinuteControl(): FormControl {
        return this.workHourGroup.get('minutes') as FormControl;
    }

    getMinuteDirectionControl(): FormControl {
        return this.workHourGroup.get('minutes_direction') as FormControl;
    }

    getSelectedUserControl(): FormControl {
        return this.workHourGroup.get('selected_user_id') as FormControl;
    }

    onSubmitClick() {
        if (this.create) {
            const workloadCreate: WorkloadCreate = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                user_id: parseInt(this.workHourGroup.get('selected_user_id').value, 10),
                minutes: parseInt(this.getMinuteControl().value, 10),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                minutes_direction: parseInt(this.getMinuteDirectionControl().value, 10),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: this.data.jobId,
            };
            this.api.createWorkloadWorkloadPost(workloadCreate).pipe(first()).subscribe(() => {
                this.closeDialog(true);
            });
        } else {
            const workloadUpdate: WorkloadUpdate = {
                minutes: parseInt(this.getMinuteControl().value, 10),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                minutes_direction: parseInt(this.getMinuteDirectionControl().value, 10),
                // eslint-disable-next-line @typescript-eslint/naming-convention
            };
            this.api.updateWorkloadWorkloadWorkloadIdPut(this.workloadId, workloadUpdate).pipe(first()).subscribe(() => {
                this.closeDialog(true);
            });
        }
    }


    closeDialog(reload: boolean): void {
        this.dialogRef.close(reload);
    }


}

