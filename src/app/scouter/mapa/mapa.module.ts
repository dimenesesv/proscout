import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapaPageRoutingModule } from './mapa-routing.module';

import { MapaPage } from './mapa.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { MapaUbicacionModalComponent } from './mapa-ubicacion-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapaPageRoutingModule,
    SharedModule,
    MapaUbicacionModalComponent
  ],
  declarations: [MapaPage]
})
export class MapaPageModule {}
