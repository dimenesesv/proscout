import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutPageRoutingModule } from './rut-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RutPage } from './rut.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [RutPage]
})
export class RutPageModule {}
