import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroScouterPage } from './registro-scouter.page';

describe('RegistroScouterPage', () => {
  let component: RegistroScouterPage;
  let fixture: ComponentFixture<RegistroScouterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroScouterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
