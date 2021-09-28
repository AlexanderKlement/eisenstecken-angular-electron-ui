import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBundleEditComponent } from './order-bundle-edit.component';

describe('OrderBundleEditComponent', () => {
  let component: OrderBundleEditComponent;
  let fixture: ComponentFixture<OrderBundleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderBundleEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBundleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
