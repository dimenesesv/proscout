import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PerfilPage } from './perfil.page';
import { TabsHeaderComponent } from './components/tabs-header/tabs-header.component';
import { PerfilCardComponent } from './components/perfil-card/perfil-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    SharedModule
  ],
  declarations: [
    PerfilPage,
    TabsHeaderComponent,
    PerfilCardComponent
  ]
})
export class PerfilPageModule {}