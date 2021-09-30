import {Component, Input, OnInit} from '@angular/core';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {DayManager} from './day.manager';
import {MatDialog} from '@angular/material/dialog';
import {CalendarData, CalendarEditComponent} from './calendar-edit/calendar-edit.component';
import {first} from 'rxjs/operators';
import {CalendarService} from './calendar.service';
import * as moment from 'moment';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

    @Input() calendarId: number;
    @Input() public: boolean;

    createMode = false;
    dayManager: DayManager;

    amountOfDays: string;


    constructor(public dialog: MatDialog, private calendar: CalendarService) {
        this.dayManager = new DayManager(0, 7);
        this.amountOfDays = this.dayManager.amountOfDaysString;
    }

    ngOnInit(): void {

    }

    previousWeekClicked(): void {
        this.dayManager.moveStartDayLeft();
    }

    nextWeekClicked(): void {
        this.dayManager.moveStartDayRight();
    }

    todayClicked(): void {
        this.dayManager.setStartDay(0);
    }

    amountOfDaysChanged(): void {
        this.dayManager.setAmountOfDays(parseInt(this.amountOfDays, 10));
    }

    newMeetingClicked(): void {
        const data: CalendarData = {
            calendarId: this.calendarId
        };
        const dialogRef = this.dialog.open(CalendarEditComponent, {
            width: '700px',
            data,
        });

        dialogRef.afterClosed().pipe(first()).subscribe(result => {
            if (result !== undefined) {
                const date = moment(result.start_time);
                const now = moment();
                this.calendar.refreshCalendar(parseInt(result.calendar.id, 10), date.diff(now, 'days'));
            }
        });
    }

}
