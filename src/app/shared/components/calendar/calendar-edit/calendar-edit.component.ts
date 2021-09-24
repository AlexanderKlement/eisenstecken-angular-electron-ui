import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {first, tap} from 'rxjs/operators';
import {Calendar, CalendarEntry, CalendarEntryCreate, DefaultService} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';
import * as moment from 'moment';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export const timeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('start_time').value;
    const endTime = control.get('end_time').value;
    if (!startTime || !endTime) {
        return {timeValid: false};
    }
    const startTimeMoment = moment(startTime, 'HH:mm');
    const endTimeMoment = moment(endTime, 'HH:mm');
    return endTimeMoment > startTimeMoment ? null : {timeValid: false};
};

export interface CalendarData {
    calendarId: number;
    calendarEntryId?: number;
}

@Component({
    selector: 'app-calendar-edit',
    templateUrl: './calendar-edit.component.html',
    styleUrls: ['./calendar-edit.component.scss']
})
export class CalendarEditComponent implements OnInit {
    submitted = false;
    createMode: boolean;

    calendarId: number;
    calendarEntryId: number; //maybe these two need to be replaced by param
    calendarEntry$: Observable<CalendarEntry>;
    calendarGroup: FormGroup;

    primaryTheme: NgxMaterialTimepickerTheme = {
        dial: {
            dialBackgroundColor: '#fdc400',
        },
        clockFace: {
            clockHandColor: '#fdc400',
        }
    };

    constructor(private api: DefaultService, public dialogRef: MatDialogRef<CalendarEditComponent>,
                @Inject(MAT_DIALOG_DATA) public data: CalendarData) {
    }

    ngOnInit(): void {
        this.createCalendarGroup();
        if (this.data.calendarEntryId === undefined) {
            this.createMode = true;
            this.calendarId = this.data.calendarId;
            if (isNaN(this.calendarId)) {
                console.error('CalendarEditComponent: Cannot parse CalendarId');
            }
        } else {
            this.createMode = false;
            this.calendarEntryId = this.data.calendarEntryId;
            this.calendarEntry$ = this.api.readCalendarEntryCalendarCalendarEntryIdGet(this.calendarEntryId);
            this.fillCalendarGroup();
        }
    }

    createCalendarGroup(): void {
        this.calendarGroup = new FormGroup({
            title: new FormControl('', Validators.required),
            description: new FormControl(''),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            date: new FormControl(new Date(), Validators.required),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            start_time: new FormControl('', Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            end_time: new FormControl('', Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'))
        }, {validators: timeValidator});
    }

    fillCalendarGroup(): void {
        this.calendarEntry$.pipe(first())
            .subscribe(calendarEntry => {
                console.log(moment(calendarEntry.start_time).format('DD.MM.YYYY'));
                this.calendarGroup.patchValue({
                    title: calendarEntry.title,
                    description: calendarEntry.description,
                    date: moment(calendarEntry.start_time), // TODO: auto select this date on edit
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    start_time: moment(calendarEntry.start_time).format('HH:mm'),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    end_time: moment(calendarEntry.end_time).format('HH:mm'),
                });
                this.calendarGroup.get('date').setValue(moment(calendarEntry.start_time).format('DD.MM.YYYY'));
            });

    }


    onSubmit(): void {
        this.submitted = true;
        const date = moment(this.calendarGroup.get('date').value);
        const startDateString = date.format('DD.MM.YYYY') + ' ' + this.calendarGroup.get('start_time').value;
        const endDateString = date.format('DD.MM.YYYY') + ' ' + this.calendarGroup.get('end_time').value;
        const startDate = moment(startDateString, 'DD.MM.YYYY HH:mm');
        const endDate = moment(endDateString, 'DD.MM.YYYY HH:mm');
        const calendarEntryCreate: CalendarEntryCreate = {
            title: this.calendarGroup.get('title').value,
            description: this.calendarGroup.get('description').value,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            start_time: startDate.format(),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            end_time: endDate.format()
        };
        if (this.createMode) {
            this.api.createCalendarEntryCalendarCalendarIdPost(this.calendarId, calendarEntryCreate).pipe(first()).subscribe(
                (calendarEntry) => {
                    this.createUpdateSuccess(calendarEntry);
                },
                (error) => {
                    this.createUpdateError(error);
                }, () => {
                    this.createUpdateComplete();
                });
        } else {
            this.api.updateCalendarEntryCalendarCalendarEntryIdPut(this.calendarEntryId, calendarEntryCreate).pipe(first()).subscribe(
                (calendarEntry) => {
                    this.createUpdateSuccess(calendarEntry);
                },
                (error) => {
                    this.createUpdateError(error);
                }, () => {
                    this.createUpdateComplete();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createUpdateSuccess(calendarEntry: CalendarEntry): void {
        this.dialogRef.close(calendarEntry);
    }


    createUpdateError(error: any): void {
        console.error('CalendarEditComponent: Could not complete ' + (this.createMode ? 'creation' : 'update'));
        console.log(error);
        this.submitted = false;
    }


    onCancel(): void {
        this.dialogRef.close();
    }

    createUpdateComplete(): void {
        this.submitted = false;
    }

    deleteButtonClicked(): void {
        this.deleteCalendarEntry();
    }

    deleteCalendarEntry(): void {
        this.api.deleteCalendarEntryCalendarCalendarIdDelete(this.calendarEntryId).pipe(first()).subscribe(() => {
            this.dialogRef.close();
        });
    }

    onDelete() {
        this.deleteCalendarEntry();
    }
}
