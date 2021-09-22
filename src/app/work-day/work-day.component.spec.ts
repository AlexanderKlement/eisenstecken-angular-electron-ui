import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDayComponent } from './work-day.component';

describe('WorkDayComponent', () => {
  let component: WorkDayComponent;
  let fixture: ComponentFixture<WorkDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
