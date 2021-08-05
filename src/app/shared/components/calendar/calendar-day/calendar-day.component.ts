import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {CalendarEntry} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss']
})
export class CalendarDayComponent implements OnInit {

  @Input() day: number;
  @Input() calendarId: number;

  calendarEntries$: Observable<CalendarEntry[]>;

  constructor() {
  }

  ngOnInit(): void {
  }

}
