import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';
import {CalendarEntry, DefaultService} from 'eisenstecken-openapi-angular-library';
import {first, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {CalendarService} from '../calendar.service';
import {CalendarData, CalendarEditComponent} from '../calendar-edit/calendar-edit.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-calendar-day',
    templateUrl: './calendar-day.component.html',
    styleUrls: ['./calendar-day.component.scss']
})
export class CalendarDayComponent implements OnInit, OnDestroy {

    @Input() day: number;
    @Input() calendarId: number;
    @Input() public: boolean;

    calendarEntries$: Observable<CalendarEntry[]>;
    titleDayOfTheWeek: string;
    titleDay: string;

    loading = true;

    constructor(private api: DefaultService, private router: Router, private calendar: CalendarService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        //The html does unsubscribe automatically onDestroy
        this.calendarEntries$ = this.calendar.getCalendarEntries(this.calendarId, this.day).pipe(
            tap(() => this.loading = false)
        );
        this.setTitle();
    }

    formatDate = (date: string): string => moment(date).format('LT');

    formatCalendarEntryDates(calendarEntries: CalendarEntry[]): CalendarEntry[] { //TODO check what this function is doing
        calendarEntries.forEach((calendarEntry) => {
            calendarEntry.start_time = this.formatDate(calendarEntry.start_time);
            calendarEntry.end_time = this.formatDate(calendarEntry.end_time);
        });
        return calendarEntries;
    }

    ngOnDestroy(): void {
        console.log('Calendar Day ' + this.day.toString() + ' getting destroyed');
    }

    onCalendarEntryClicked(id: number): void {
        const data: CalendarData = {
            calendarId: this.calendarId,
            calendarEntryId: id
        };
        const dialogRef = this.dialog.open(CalendarEditComponent, {
            width: '700px',
            data,
        });
        dialogRef.afterClosed().pipe(first()).subscribe(result => {
            if (result !== undefined) {
                this.calendar.refreshCalendar(parseInt(result.calendar.id, 10), this.day);
            }
        });
    }

    getCalendarStartEndTime(calendar: CalendarEntry): string {
        return moment(calendar.start_time).format('LT') + '-' + moment(calendar.end_time).format('LT');
    }

    private setTitle(): void {
        const todaysDate = moment().add(this.day, 'days');
        this.titleDayOfTheWeek = todaysDate.format('dddd');
        this.titleDay = todaysDate.format('Do MMMM');
    }


}
