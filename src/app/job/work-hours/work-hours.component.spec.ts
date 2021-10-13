import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkHoursComponent } from './work-hours.component';

describe('WorkHoursComponent', () => {
  let component: WorkHoursComponent;
  let fixture: ComponentFixture<WorkHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
