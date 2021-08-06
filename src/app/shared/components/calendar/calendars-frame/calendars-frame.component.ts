import { Component, OnInit } from '@angular/core';
import {Calendar, DefaultService} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {first, tap} from "rxjs/operators";

@Component({
  selector: 'app-calendars-frame',
  templateUrl: './calendars-frame.component.html',
  styleUrls: ['./calendars-frame.component.scss']
})
export class CalendarsFrameComponent implements OnInit {

  calendars$: Observable<Calendar[]>;
  loading = true;

  constructor(private api: DefaultService) {

  }

  ngOnInit(): void {
    this.calendars$ = this.api.readCalendarsCalendarGet().pipe(first(), tap(() => {
      this.loading = false;
    }));
  }

}
