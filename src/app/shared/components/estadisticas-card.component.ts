import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RadarChartComponent } from 'src/app/radar-chart/radar-chart.component';

@Component({
  selector: 'app-estadisticas-card',
  templateUrl: './estadisticas-card.component.html',
  styleUrls: ['./estadisticas-card.component.scss'],
  standalone: true,
  imports: [IonicModule, RadarChartComponent]
})
export class EstadisticasCardComponent {
  @Input() perfilUsuario: any;
}
