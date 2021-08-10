import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterableClickableListComponent } from './filterable-clickable-list.component';

describe('FilterableClickableListComponent', () => {
  let component: FilterableClickableListComponent;
  let fixture: ComponentFixture<FilterableClickableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterableClickableListComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterableClickableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
