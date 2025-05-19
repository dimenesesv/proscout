import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RadarChartComponent } from '../radar-chart/radar-chart.component';
import { PlayerPerfilCardComponent } from '../player/tab4/components/perfil-card/perfil-card.component';
import { EstadisticasCardComponent } from '../player/tab4/components/estadisticas-card/estadisticas-card.component';
import { PlayerTabsHeaderComponent } from '../player/tab4/components/tabs-header/tabs-header.component';

@NgModule({
  declarations: [
    RadarChartComponent,
    PlayerPerfilCardComponent,
    EstadisticasCardComponent,
    PlayerTabsHeaderComponent
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    RadarChartComponent,
    PlayerPerfilCardComponent,
    EstadisticasCardComponent,
    PlayerTabsHeaderComponent
  ],
})
export class SharedModule {}