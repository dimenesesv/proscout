import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluacionesPage } from './evaluaciones.page';

describe('EvaluacionesPage', () => {
  let component: EvaluacionesPage;
  let fixture: ComponentFixture<EvaluacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
