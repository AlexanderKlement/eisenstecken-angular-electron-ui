import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableProductsListComponent } from './available-products-list.component';

describe('AvailableProductsListComponent', () => {
  let component: AvailableProductsListComponent;
  let fixture: ComponentFixture<AvailableProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableProductsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
