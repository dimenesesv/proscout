import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/interfaces/usuario';
import { inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-perfil-card',
  templateUrl: './perfil-card.component.html',
  styleUrls: ['./perfil-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PerfilCardComponent {
  @Input() perfilUsuario!: Usuario;
  @Input() comuna: string = '';
  @Input() ciudad: string = '';

  private firebaseService = inject(FirebaseService);
  private notificacionesService = inject(NotificacionesService);
  private afAuth = inject(AngularFireAuth);

  calcularEdad(fechaNacimiento?: string): string {
    if (!fechaNacimiento) return '-';
    const partes = fechaNacimiento.split('-');
    let anio, mes, dia;
    if (partes.length === 3) {
      anio = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10) - 1;
      dia = parseInt(partes[2], 10);
    } else if (partes.length === 1 && fechaNacimiento.length === 10) {
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

  async agregarAFavoritos() {
    // Obtiene el usuario actual (scouter)
    const scouter = await this.afAuth.currentUser;
    // Usa 'id' en vez de 'uid' para el jugador
    const jugadorId = (this.perfilUsuario as any).id;
    if (!scouter || !jugadorId) return;
    const scouterId = scouter.uid;
    const path = `favoritos/${scouterId}`;
    // Obtiene o crea el documento de favoritos del scouter
    let doc = await this.firebaseService.getDocument(path);
    let favoritos: string[] = doc?.jugadores || [];
    if (!favoritos.includes(jugadorId)) {
      favoritos.push(jugadorId);
      await this.firebaseService.setDocument(path, { scouterId, jugadores: favoritos });
      // Notifica al jugador
      await this.notificacionesService.notificarFavorito(jugadorId, scouterId);
    }
  }
}
