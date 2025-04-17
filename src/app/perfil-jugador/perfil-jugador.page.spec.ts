import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilJugadorPage } from './perfil-jugador.page';

describe('PerfilJugadorPage', () => {
  let component: PerfilJugadorPage;
  let fixture: ComponentFixture<PerfilJugadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilJugadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
