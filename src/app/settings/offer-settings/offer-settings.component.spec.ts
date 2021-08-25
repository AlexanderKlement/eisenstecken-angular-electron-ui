import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferSettingsComponent } from './offer-settings.component';

describe('OfferSettingsComponent', () => {
  let component: OfferSettingsComponent;
  let fixture: ComponentFixture<OfferSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
