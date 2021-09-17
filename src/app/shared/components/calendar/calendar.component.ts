import {Component, Input, OnInit} from '@angular/core';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {ActivatedRoute, Router} from '@angular/router';
import {DayManager} from './day.manager';

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

  @Input() calendarId: number;
  @Input() public: boolean;

  constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) {
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
    this.router.navigateByUrl('/calendar/new/' + this.calendarId.toString());
  }

}
