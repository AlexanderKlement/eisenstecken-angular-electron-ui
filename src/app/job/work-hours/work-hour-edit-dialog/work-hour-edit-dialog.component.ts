import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';

export interface WorkHourEditDialogData {
    user: string;
    minutes: number;
}

@Component({
    selector: 'app-work-hour-edit-dialog',
    templateUrl: './work-hour-edit-dialog.component.html',
    styleUrls: ['./work-hour-edit-dialog.component.scss']
})
export class WorkHourEditDialogComponent implements OnInit {

    minutes = '';

    constructor(
        public dialogRef: MatDialogRef<WorkHourEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: WorkHourEditDialogData) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


    ngOnInit(): void {
    }


    onSubmitClick() {
        this.dialogRef.close({
            user: this.data.user,
            minutes: parseInt(this.minutes, 10),
        });
    }
}
