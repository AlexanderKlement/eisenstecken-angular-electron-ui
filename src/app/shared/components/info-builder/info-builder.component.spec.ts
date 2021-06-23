import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBuilderComponent } from './info-builder.component';

describe('InfoBuilderComponent', () => {
  let component: InfoBuilderComponent;
  let fixture: ComponentFixture<InfoBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
