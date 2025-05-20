import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';

@Component({
  selector: 'player-app-perfil-card',
  templateUrl: './perfil-card.component.html',
  styleUrls: ['./perfil-card.component.scss'],
  standalone: false,
})
export class PlayerPerfilCardComponent {
  @Input() perfilUsuario!: any; // Accept any type to allow flexible binding from mapa.page
  @Input() comuna: string = '';
  @Input() ciudad: string = '';

  calcularEdad(fechaNacimiento?: string): string {
    if (!fechaNacimiento) return '-';
    const partes = fechaNacimiento.split('-');
    let anio, mes, dia;
    if (partes.length === 3) {
      // Formato yyyy-mm-dd
      anio = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10) - 1;
      dia = parseInt(partes[2], 10);
    } else if (partes.length === 1 && fechaNacimiento.length === 10) {
      // Formato dd/mm/yyyy
      [dia, mes, anio] = fechaNacimiento.split('/').map(Number);
      mes = mes - 1;
    } else {
      return '-';
    }
    const nacimiento = new Date(anio, mes, dia);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad.toString();
  }
}