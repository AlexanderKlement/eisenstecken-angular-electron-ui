import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinuteHourComponent } from './minute-hour.component';

describe('MinuteHourComponent', () => {
  let component: MinuteHourComponent;
  let fixture: ComponentFixture<MinuteHourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinuteHourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinuteHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
