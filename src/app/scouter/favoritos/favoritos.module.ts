import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritosPageRoutingModule } from './favoritos-routing.module';

import { FavoritosPage } from './favoritos.page';
import { SeleccionJugadorModalComponent } from './seleccion-jugador-modal.component';
import { CanchaModalComponent } from './cancha-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritosPageRoutingModule,
    SeleccionJugadorModalComponent,
    CanchaModalComponent
  ],
  declarations: [FavoritosPage]
})
export class FavoritosPageModule {}
