import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedArticleEditComponent } from './ordered-article-edit.component';

describe('OrderedArticleEditComponent', () => {
  let component: OrderedArticleEditComponent;
  let fixture: ComponentFixture<OrderedArticleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderedArticleEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderedArticleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
