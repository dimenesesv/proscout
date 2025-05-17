import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab4PageRoutingModule } from './tab4-routing.module';
import { Tab4Page } from './tab4.page';
import { FirebaseService } from '../../services/firebase.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { PlayerTabsHeaderComponent } from './components/tabs-header/tabs-header.component';
import { PlayerPerfilCardComponent } from './components/perfil-card/perfil-card.component';
import { EstadisticasCardComponent } from './components/estadisticas-card/estadisticas-card.component'; // <-- Add this

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
    SharedModule,
  ],
  declarations: [
    Tab4Page,
    PlayerTabsHeaderComponent,
    PlayerPerfilCardComponent,
    EstadisticasCardComponent,
  ],
  providers: [FirebaseService]
})
export class Tab4PageModule {}