import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NacionalidadPageRoutingModule } from './nacionalidad-routing.module';

import { NacionalidadPage } from './nacionalidad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NacionalidadPageRoutingModule
  ],
  declarations: [NacionalidadPage]
})
export class NacionalidadPageModule {}
