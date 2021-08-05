import {Component, Input, OnInit} from '@angular/core';
import {first, tap} from "rxjs/operators";
import {CalendarEntry, CalendarEntryCreate, DefaultService} from "eisenstecken-openapi-angular-library";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-calendar-edit',
  templateUrl: './calendar-edit.component.html',
  styleUrls: ['./calendar-edit.component.scss']
})
export class CalendarEditComponent implements OnInit {

  @Input() calendarId: number;

  submitted = false;
  createMode: boolean;

  calendarEntryId: number; //maybe these two need to be replaced by param
  calendarEntry$: Observable<CalendarEntry>;
  calendarGroup: FormGroup;

  constructor(private api: DefaultService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe((params) => {
      if(params.mode == "new"){
        this.createMode = true;
        this.calendarId = parseInt(params.id);
        if(isNaN(this.calendarId)){
          console.error("CalendarEditComponent: Cannot parse CalendarId");
        }
      }
      else if (params.mode == "edit"){
        this.createMode = false;
        this.calendarEntryId = parseInt(params.id);
        if(isNaN(this.calendarEntryId)){
          console.error("CalendarEditComponent: Cannot parse CalendarEntryId");
          return;
        }
        this.calendarEntry$ = this.api.readCalendarEntryCalendarCalendarEntryIdGet(this.calendarEntryId);
      }
      else {
        console.warn("CalendarEditComponent: No correct mode was selected"); //TODO: add sentry here
      }
    });
    this.createCalendarGroup();
    this.fillCalendarGroup();
  }

  createCalendarGroup(): void {
    this.calendarGroup = new FormGroup({
      title: new FormControl(""),
      description: new FormControl(""),
      start_time: new FormControl(""),
      end_time: new FormControl("")
    });
  }

  fillCalendarGroup(): void {
    if(!this.createMode){
      this.calendarEntry$.pipe(tap(calendarEntry => this.calendarGroup.patchValue(calendarEntry))).subscribe(); //TODO: unsubscribe on destroy
    }
  }


  onSubmit():void {
    this.submitted = true;
    if(this.createMode){
      const calendarEntryCreate: CalendarEntryCreate = {
        title: this.calendarGroup.get("title").value,
        description: this.calendarGroup.get("description").value,
        start_time: this.calendarGroup.get("start_time").value,
        end_time: this.calendarGroup.get("end_time").value
      };
      console.log(this.calendarId);
      this.api.createCalendarEntryCalendarCalendarIdPost(this.calendarId, calendarEntryCreate).pipe(first()).subscribe(
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

  createUpdateSuccess(calendarEntry): void {
    this.router.navigateByUrl("/"); //This is only valid if calendar gets used in main window. I have a feeling that this will bite my neck some day
  }

  createUpdateError(error): void {
    console.error("CalendarEditComponent: Could not complete " + (this.createMode ? "creation" : "update"));
  }

  createUpdateComplete():void {
    this.submitted = false;
  }
}
