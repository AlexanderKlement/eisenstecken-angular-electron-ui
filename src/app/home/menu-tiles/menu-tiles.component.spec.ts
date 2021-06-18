import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTilesComponent } from './menu-tiles.component';

describe('MenuTilesComponent', () => {
  let component: MenuTilesComponent;
  let fixture: ComponentFixture<MenuTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTilesComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
