import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculationDetailComponent } from './recalculation-detail.component';

describe('RecalculationDetailComponent', () => {
  let component: RecalculationDetailComponent;
  let fixture: ComponentFixture<RecalculationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecalculationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecalculationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
