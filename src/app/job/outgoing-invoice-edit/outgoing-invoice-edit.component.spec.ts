import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingInvoiceEditComponent } from './outgoing-invoice-edit.component';

describe('OutgoingInvoiceEditComponent', () => {
  let component: OutgoingInvoiceEditComponent;
  let fixture: ComponentFixture<OutgoingInvoiceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutgoingInvoiceEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutgoingInvoiceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
