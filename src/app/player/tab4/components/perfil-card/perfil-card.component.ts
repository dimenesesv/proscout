import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-perfil-card',
  templateUrl: './perfil-card.component.html',
  imports: [IonicModule],
  styleUrls: ['./perfil-card.component.scss'],
})
export class PerfilCardComponent {
  @Input() userProfile: any;
}