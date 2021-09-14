import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingComponent } from './outgoing.component';

describe('OutgoingComponent', () => {
  let component: OutgoingComponent;
  let fixture: ComponentFixture<OutgoingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutgoingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutgoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
