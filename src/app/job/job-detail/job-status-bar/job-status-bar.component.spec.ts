import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusBarComponent } from './job-status-bar.component';

describe('JobStatusBarComponent', () => {
  let component: JobStatusBarComponent;
  let fixture: ComponentFixture<JobStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
