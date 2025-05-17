import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EstadisticasCardComponent } from './estadisticas-card.component';

describe('EstadisticasCardComponent', () => {
  let component: EstadisticasCardComponent;
  let fixture: ComponentFixture<EstadisticasCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadisticasCardComponent ],
      imports: [IonicModule.forRoot(),IonicModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadisticasCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
