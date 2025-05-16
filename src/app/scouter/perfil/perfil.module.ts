import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import { TabsHeaderComponent } from "../../player/tab4/components/tabs-header/tabs-header.component";
import { PerfilCardComponent } from "../../player/tab4/components/perfil-card/perfil-card.component";
import { RadarChartComponent } from 'src/app/radar-chart/radar-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    TabsHeaderComponent,
    PerfilCardComponent,
],
  declarations: [PerfilPage, RadarChartComponent]
})
export class PerfilPageModule {}
