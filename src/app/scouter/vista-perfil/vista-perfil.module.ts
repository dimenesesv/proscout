import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VistaPerfilPageRoutingModule } from './vista-perfil-routing.module';
import { VistaPerfilPage } from './vista-perfil.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { RadarChartComponent } from 'src/app/radar-chart/radar-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VistaPerfilPageRoutingModule,
    SharedModule,
    RadarChartComponent
  ],
  declarations: [
    VistaPerfilPage,
  ]
})
export class VistaPerfilPageModule {}
