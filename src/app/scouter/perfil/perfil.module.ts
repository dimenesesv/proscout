import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PerfilPage } from './perfil.page';
import { FirebaseService } from '../../services/firebase.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    SharedModule,
  ],
  declarations: [
    PerfilPage
  ],
  providers: [FirebaseService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PerfilPageModule {}