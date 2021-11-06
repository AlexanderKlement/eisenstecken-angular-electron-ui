import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCreateDialogComponent } from './service-create-dialog.component';

describe('ServiceCreateDialogComponent', () => {
  let component: ServiceCreateDialogComponent;
  let fixture: ComponentFixture<ServiceCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCreateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
