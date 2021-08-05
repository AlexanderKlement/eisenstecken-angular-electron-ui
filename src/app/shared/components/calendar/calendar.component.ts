import {Component, OnInit} from '@angular/core';
import {DefaultService} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {DayManager} from "./day.manager";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  createMode = false;
  calendarId = 1;
  dayManager: DayManager;

  amountOfDays: string;

  constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {
    this.dayManager = new DayManager(0, 3);
    this.amountOfDays = this.dayManager.amountOfDaysString;
  }

  ngOnInit(): void {

  }

  previousDayClicked(): void {
    this.dayManager.moveStartDayLeft();
  }

  nextDayClicked(): void {
    this.dayManager.moveStartDayRight();
  }

  todayClicked(): void {
    this.dayManager.setStartDay(0);
  }

  amountOfDaysChanged() : void {
    this.dayManager.setAmountOfDays(parseInt(this.amountOfDays));
  }

  newMeetingClicked(): void {
    this.router.navigateByUrl('/calendar/new/' + this.calendarId.toString());
  }

}
