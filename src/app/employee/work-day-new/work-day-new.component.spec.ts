import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkDayNewComponent } from './work-day-new.component';

describe('WorkDayNewComponent', () => {
  let component: WorkDayNewComponent;
  let fixture: ComponentFixture<WorkDayNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkDayNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkDayNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
