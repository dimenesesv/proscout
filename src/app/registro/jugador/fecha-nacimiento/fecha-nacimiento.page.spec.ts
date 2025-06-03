import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FechaNacimientoPage } from './fecha-nacimiento.page';

describe('FechaNacimientoPage', () => {
  let component: FechaNacimientoPage;
  let fixture: ComponentFixture<FechaNacimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FechaNacimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
