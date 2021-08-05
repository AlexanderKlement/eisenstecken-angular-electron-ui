import { Component, OnInit } from '@angular/core';
import {CalendarEntry, DefaultService} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs/operators";
import {Observable} from "rxjs";

interface Days {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  days: Days[] = [
    {value: '2', viewValue: '2'},
    {value: '3', viewValue: '3'},
    {value: '5', viewValue: '5'},
    {value: '7', viewValue: '7'},
    {value: '10', viewValue: '10'},
  ];

  createMode = false; //TODO: add calendar id as input character
  calendarId = 1;

  constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

  }

  previousDayClicked(): void {

  }

  nextDayClicked(): void {

  }

  todayClicked(): void {

  }

  amountOfDaysChanged() : void {

  }

  newMeetingClicked(): void {
    this.router.navigateByUrl('/calendar/new/' + this.calendarId.toString());
  }

}
