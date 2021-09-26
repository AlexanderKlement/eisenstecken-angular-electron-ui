import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBundleDetailComponent } from './order-bundle-detail.component';

describe('OrderBundleDetailComponent', () => {
  let component: OrderBundleDetailComponent;
  let fixture: ComponentFixture<OrderBundleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderBundleDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBundleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
