import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';
import {CalendarEntry, DefaultService} from 'eisenstecken-openapi-angular-library';
import {first, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss']
})
export class CalendarDayComponent implements OnInit, OnDestroy{

  @Input() day: number;
  @Input() calendarId: number;
  @Input() public: boolean;

  calendarEntries$: Observable<CalendarEntry[]>;
  lastJson = '';
  titleDayOfTheWeek: string;
  titleDay: string;

  loading = true;
  updateDelayMilliSeconds = 20000;
  updateInterval: NodeJS.Timeout;

  constructor(private api: DefaultService, private router: Router) {
  }

  ngOnInit(): void {
    this.calendarEntries$ = new Observable<CalendarEntry[]>(
      (observer) => {
        this.check4CalendarEntries(observer);
        this.updateInterval = setInterval(() => {
          this.check4CalendarEntries(observer);
        }, this.updateDelayMilliSeconds);
      }
    );
    this.setTitle();
  }

  check4CalendarEntries(observer: Subscriber<CalendarEntry[]>): void {
    this.api.readCalendarEntriesByDayCalendarCalendarsCalendarIdGet(this.calendarId, this.day).
    pipe(first()).subscribe((calendarEntries) => {
      calendarEntries = this.formatCalendarEntryDates(calendarEntries);
      if(this.loading){
        observer.next(calendarEntries);
        this.lastJson = JSON.stringify(calendarEntries);
        this.loading = false;
        return;
      }
      const thisJson = JSON.stringify(calendarEntries); //I did a timer here: <0.01 ms
      if(this.lastJson !== thisJson){
        observer.next(calendarEntries);
        this.lastJson = thisJson;
        console.log('CalendarDay: new CalenderEntries array pushed');
      }
    });
  }

  formatDate = (date: string): string => moment(date).format('h:mm');

  formatCalendarEntryDates(calendarEntries: CalendarEntry[]): CalendarEntry[] {
    calendarEntries.forEach((calendarEntry) => {
      calendarEntry.start_time = this.formatDate(calendarEntry.start_time);
      calendarEntry.end_time = this.formatDate(calendarEntry.end_time);
    });
    return calendarEntries;
  }

  ngOnDestroy(): void {
    console.log('Calendar Day ' + this.day.toString() + ' getting destroyed');
    clearInterval(this.updateInterval);
  }

  onCalendarEntryClicked(id: number): void {
    this.router.navigateByUrl('/calendar/edit/' + id.toString());
  }

  private setTitle(): void {
    const todaysDate = moment().add(this.day, 'days');
    this.titleDayOfTheWeek = todaysDate.format('dddd');
    this.titleDay = todaysDate.format('Do MMMM');
  }




}
