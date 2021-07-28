import { Component, OnInit } from '@angular/core';

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
    {value: '4', viewValue: '4'}
  ];

  constructor() { }

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

  }

}
