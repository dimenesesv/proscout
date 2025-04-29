import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionRolPage } from './seleccion-rol.page';

describe('SeleccionRolPage', () => {
  let component: SeleccionRolPage;
  let fixture: ComponentFixture<SeleccionRolPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionRolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
