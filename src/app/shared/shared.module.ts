import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PerfilCardComponent } from './components/perfil-card.component';
import { EstadisticasCardComponent } from './components/estadisticas-card.component';
import { GaleriaCardComponent } from './components/galeria-card.component';
import { TabsHeaderComponent } from './components/tabs-header.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PerfilCardComponent,
    EstadisticasCardComponent,
    GaleriaCardComponent,
    TabsHeaderComponent
  ],
  exports: [
    PerfilCardComponent,
    EstadisticasCardComponent,
    GaleriaCardComponent,
    TabsHeaderComponent
  ]
})
export class SharedModule {}