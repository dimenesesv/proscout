import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RutPage } from './rut.page';

describe('RutPage', () => {
  let component: RutPage;
  let fixture: ComponentFixture<RutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
