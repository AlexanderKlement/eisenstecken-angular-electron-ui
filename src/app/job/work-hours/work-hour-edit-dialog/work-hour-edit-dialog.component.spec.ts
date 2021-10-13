import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkHourEditDialogComponent } from './work-hour-edit-dialog.component';

describe('WorkHourEditDialogComponent', () => {
  let component: WorkHourEditDialogComponent;
  let fixture: ComponentFixture<WorkHourEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkHourEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkHourEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
