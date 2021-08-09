import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarsChatFrameComponent } from './calendars-chat-frame.component';

describe('CalendarsFrameComponent', () => {
  let component: CalendarsChatFrameComponent;
  let fixture: ComponentFixture<CalendarsChatFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarsChatFrameComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarsChatFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
