import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NacionalidadPage } from './nacionalidad.page';

describe('NacionalidadPage', () => {
  let component: NacionalidadPage;
  let fixture: ComponentFixture<NacionalidadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NacionalidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
