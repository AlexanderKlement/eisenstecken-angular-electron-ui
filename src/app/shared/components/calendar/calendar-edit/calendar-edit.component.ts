import {Component, Input, OnInit} from '@angular/core';
import {first, tap} from 'rxjs/operators';
import {CalendarEntry, CalendarEntryCreate, DefaultService} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {CustomButton} from '../../toolbar/toolbar.component';

@Component({
  selector: 'app-calendar-edit',
  templateUrl: './calendar-edit.component.html',
  styleUrls: ['./calendar-edit.component.scss']
})
export class CalendarEditComponent implements OnInit {

  public buttons: CustomButton[]  = [
    {
      name: 'Löschen',
      navigate:   (): void => {
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
      title: new FormControl(''),
      description: new FormControl(''),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      start_time: new FormControl(''),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      end_time: new FormControl('')
    });
  }

  fillCalendarGroup(): void {
    if (!this.createMode) {
      this.calendarEntry$.pipe(first(), tap(calendarEntry => this.calendarGroup.patchValue(calendarEntry))).subscribe();
    }
  }


  onSubmit(): void {
    this.submitted = true;
    const calendarEntryCreate: CalendarEntryCreate = {
      title: this.calendarGroup.get('title').value,
      description: this.calendarGroup.get('description').value,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      start_time: this.calendarGroup.get('start_time').value,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      end_time: this.calendarGroup.get('end_time').value
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  createUpdateError(error: any): void {
    console.error('CalendarEditComponent: Could not complete ' + (this.createMode ? 'creation' : 'update'));
    console.log(error);
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
