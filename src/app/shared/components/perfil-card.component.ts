import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class PerfilCardComponent implements OnInit, OnDestroy {
  @Input() perfilUsuario!: Usuario;
  @Input() jugadorId?: string; // Permite pasar el id explícitamente
  @Input() comuna: string = '';
  @Input() ciudad: string = '';

  private firebaseService = inject(FirebaseService);
  private notificacionesService = inject(NotificacionesService);
  private afAuth = inject(AngularFireAuth);

  ngOnInit() {
    // Inicialización de recursos si es necesario
  }

  ngOnDestroy() {
    // Limpieza de recursos, listeners, timers, etc. si es necesario
  }

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
    console.log('[PerfilCardComponent] agregarAFavoritos INICIO', this.perfilUsuario);
    const scouter = await this.afAuth.currentUser;
    // Usa el jugadorId del input si está definido
    let jugadorId: string | undefined = this.jugadorId;
    // Si no, intenta obtenerlo de los atributos conocidos
    if (!jugadorId) {
      if ((this.perfilUsuario as any).uid) {
        jugadorId = (this.perfilUsuario as any).uid;
      } else if ((this.perfilUsuario as any).id) {
        jugadorId = (this.perfilUsuario as any).id;
      } else if ((this.perfilUsuario as any)._id) {
        jugadorId = (this.perfilUsuario as any)._id;
      } else if ((this.perfilUsuario as any).usuario?.uid) {
        jugadorId = (this.perfilUsuario as any).usuario.uid;
      } else if ((this.perfilUsuario as any)['__docId']) {
        jugadorId = (this.perfilUsuario as any)['__docId'];
      }
    }
    if (!jugadorId) {
      console.error('[PerfilCardComponent] No se encontró el id del jugador. Debes pasarlo como @Input jugadorId o incluirlo en el objeto perfilUsuario.');
      return;
    }
    if (!scouter) {
      console.warn('[PerfilCardComponent] agregarAFavoritos: No hay scouter autenticado');
      return;
    }
    const scouterId = scouter.uid;
    const path = `favoritos/${scouterId}`;
    let doc = await this.firebaseService.getDocument(path);
    let favoritos: string[] = doc?.jugadores || [];
    if (!favoritos.includes(jugadorId)) {
      favoritos.push(jugadorId);
      console.log('[PerfilCardComponent] Guardando nuevo favorito', { path, scouterId, favoritos });
      await this.firebaseService.setDocument(path, { scouterId, jugadores: favoritos });
      // Notifica al jugador
      try {
        console.log('[PerfilCardComponent] Llamando notificacionesService.notificarFavorito', { jugadorId, scouterId });
        await this.notificacionesService.notificarFavorito(jugadorId, scouterId);
        console.log('[PerfilCardComponent] Notificación enviada correctamente');
      } catch (error) {
        console.error('[PerfilCardComponent] Error al notificar favorito', error);
      }
    } else {
      console.log('[PerfilCardComponent] El jugador ya está en favoritos', { jugadorId });
    }
  }
}
