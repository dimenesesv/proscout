import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadarChartComponent } from '../radar-chart/radar-chart.component'; // Ajusta la ruta según tu estructura de carpetas

@NgModule({
  declarations: [RadarChartComponent],
  imports: [CommonModule],
  exports: [RadarChartComponent], // Exporta para poder usarlo en otros módulos
})
export class SharedModule {}