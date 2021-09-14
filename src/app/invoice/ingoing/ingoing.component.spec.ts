import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngoingComponent } from './ingoing.component';

describe('IngoingComponent', () => {
  let component: IngoingComponent;
  let fixture: ComponentFixture<IngoingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngoingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
