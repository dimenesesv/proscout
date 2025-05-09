import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab4PageRoutingModule } from './tab4-routing.module';

import { Tab4Page } from './tab4.page';
import { FirebaseService } from '../services/firebase.service';
import { RadarChartComponent } from '../radar-chart/radar-chart.component'; // ajusta la ruta




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule
  ],
  declarations: [Tab4Page,RadarChartComponent],
  providers: [FirebaseService]
})
export class Tab4PageModule {}
