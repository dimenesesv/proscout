import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorLegalPage } from './tutor-legal.page';

describe('TutorLegalPage', () => {
  let component: TutorLegalPage;
  let fixture: ComponentFixture<TutorLegalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorLegalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
