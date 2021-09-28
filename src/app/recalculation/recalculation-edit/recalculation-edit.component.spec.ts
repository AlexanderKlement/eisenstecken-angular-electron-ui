import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculationEditComponent } from './recalculation-edit.component';

describe('RecalculationEditComponent', () => {
  let component: RecalculationEditComponent;
  let fixture: ComponentFixture<RecalculationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecalculationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecalculationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
