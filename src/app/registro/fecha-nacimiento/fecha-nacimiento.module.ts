import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FechaNacimientoPageRoutingModule } from './fecha-nacimiento-routing.module';

import { FechaNacimientoPage } from './fecha-nacimiento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FechaNacimientoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [FechaNacimientoPage]
})
export class FechaNacimientoPageModule {}
