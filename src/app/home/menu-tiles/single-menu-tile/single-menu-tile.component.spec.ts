import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleMenuTileComponent } from './single-menu-tile.component';

describe('SingleMenuTileComponent', () => {
  let component: SingleMenuTileComponent;
  let fixture: ComponentFixture<SingleMenuTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleMenuTileComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleMenuTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
