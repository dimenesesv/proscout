import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tab4Page } from './tab4.page';
import Swiper from 'swiper';

describe('Tab4Page', () => {
  let component: Tab4Page;
  let fixture: ComponentFixture<Tab4Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Tab4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
