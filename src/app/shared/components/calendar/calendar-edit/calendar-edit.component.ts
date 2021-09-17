import {Component, OnInit} from '@angular/core';
import {first, tap} from 'rxjs/operators';
import {Calendar, CalendarEntry, CalendarEntryCreate, DefaultService} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {CustomButton} from '../../toolbar/toolbar.component';
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';
import * as moment from 'moment';
import {BaseEditComponent} from '../../base-edit/base-edit.component';

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


@Component({
  selector: 'app-calendar-edit',
  templateUrl: './calendar-edit.component.html',
  styleUrls: ['./calendar-edit.component.scss']
})
export class CalendarEditComponent implements OnInit {

  public buttons: CustomButton[] = [
    {
      name: 'Löschen',
      navigate: (): void => {
        this.deleteButtonClicked();
      }
    }
  ];

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

  constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe((params) => {
      if (params.mode === 'new') {
        this.createMode = true;
        this.calendarId = parseInt(params.id, 10);
        if (isNaN(this.calendarId)) {
          console.error('CalendarEditComponent: Cannot parse CalendarId');
        }
      } else if (params.mode === 'edit') {
        this.createMode = false;
        this.calendarEntryId = parseInt(params.id, 10);
        if (isNaN(this.calendarEntryId)) {
          console.error('CalendarEditComponent: Cannot parse CalendarEntryId');
          return;
        }
        this.calendarEntry$ = this.api.readCalendarEntryCalendarCalendarEntryIdGet(this.calendarEntryId);
      } else {
        console.warn('CalendarEditComponent: No correct mode was selected'); //TODO: add sentry here
      }
    });
    this.createCalendarGroup();
    this.fillCalendarGroup();
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
    if (!this.createMode) {
      this.calendarEntry$.pipe(first(), tap(calendarEntry => this.calendarGroup.patchValue(calendarEntry))).subscribe();
    }
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
    this.router.navigateByUrl('/'); //This is only valid if calendar gets used in main window.
    // I have a feeling that this will bite my neck some day
  }


  createUpdateError(error: any): void {
    console.error('CalendarEditComponent: Could not complete ' + (this.createMode ? 'creation' : 'update'));
    console.log(error);
    this.submitted = false;
  }

  createUpdateComplete(): void {
    this.submitted = false;
  }

  cancelButtonClicked(): void {
    this.router.navigateByUrl('/');
  }

  deleteButtonClicked(): void {
    if (this.createMode) {
      this.router.navigateByUrl('/');
    } else {
      this.deleteCalendarEntry();
    }
  }

  deleteCalendarEntry(): void {
    this.api.deleteCalendarEntryCalendarCalendarIdDelete(this.calendarEntryId).pipe(first()).subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }
}
