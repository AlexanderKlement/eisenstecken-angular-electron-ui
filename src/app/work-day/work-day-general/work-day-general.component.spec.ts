import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDayGeneralComponent } from './work-day-general.component';

describe('WorkDayGeneralComponent', () => {
  let component: WorkDayGeneralComponent;
  let fixture: ComponentFixture<WorkDayGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkDayGeneralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDayGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
