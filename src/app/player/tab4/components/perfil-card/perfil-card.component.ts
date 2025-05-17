import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'player-app-perfil-card',
  templateUrl: './perfil-card.component.html',
  styleUrls: ['./perfil-card.component.scss'],
  standalone: false
})
export class PlayerPerfilCardComponent {
  @Input() userProfile: any;
}