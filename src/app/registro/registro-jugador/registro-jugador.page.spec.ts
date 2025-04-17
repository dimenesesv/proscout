import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroJugadorPage } from './registro-jugador.page';

describe('RegistroJugadorPage', () => {
  let component: RegistroJugadorPage;
  let fixture: ComponentFixture<RegistroJugadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroJugadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
