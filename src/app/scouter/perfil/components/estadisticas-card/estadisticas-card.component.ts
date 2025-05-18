import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-estadisticas-card',
  templateUrl: './estadisticas-card.component.html',
  styleUrls: ['./estadisticas-card.component.scss'],
  standalone: false
})
export class EstadisticasCardComponent {
  @Input() perfilUsuario: any;
}