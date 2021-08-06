import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarsFrameComponent } from './calendars-frame.component';

describe('CalendarsFrameComponent', () => {
  let component: CalendarsFrameComponent;
  let fixture: ComponentFixture<CalendarsFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarsFrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarsFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
