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
  @Input() jugadorId?: string; // Permite pasar el id explícitamente
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
    console.log('[PerfilCardComponent] agregarAFavoritos INICIO', this.perfilUsuario);
    const scouter = await this.afAuth.currentUser;
    let jugadorId: string | undefined = this.jugadorId;
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
    // --- Actualiza favoritos en scouters/{scouterId} ---
    const db = (await import('firebase/firestore')).getFirestore();
    const scouterRef = (await import('firebase/firestore')).doc(db, 'scouters', scouterId);
    const scouterSnap = await (await import('firebase/firestore')).getDoc(scouterRef);
    let favoritos: string[] = [];
    if (scouterSnap.exists()) {
      const data = scouterSnap.data() as any;
      favoritos = Array.isArray(data.favoritos) ? data.favoritos : [];
    }
    if (!favoritos.includes(jugadorId)) {
      favoritos.push(jugadorId);
      await (await import('firebase/firestore')).updateDoc(scouterRef, { favoritos });
    }
    // --- Actualiza favoritos en usuarios/{jugadorId} ---
    const jugadorRef = (await import('firebase/firestore')).doc(db, 'usuarios', jugadorId);
    const jugadorSnap = await (await import('firebase/firestore')).getDoc(jugadorRef);
    let favoritosJugador: string[] = [];
    if (jugadorSnap.exists()) {
      const data = jugadorSnap.data() as any;
      favoritosJugador = Array.isArray(data.favoritos) ? data.favoritos : [];
    }
    if (!favoritosJugador.includes(scouterId)) {
      favoritosJugador.push(scouterId);
      await (await import('firebase/firestore')).updateDoc(jugadorRef, { favoritos: favoritosJugador });
    }
    // Notifica al jugador
    try {
      await this.notificacionesService.notificarFavorito(jugadorId, scouterId);
    } catch (error) {
      console.error('[PerfilCardComponent] Error al notificar favorito', error);
    }
    alert('¡Jugador agregado a favoritos!');
    window.location.href = '/scouter/favoritos';
  }
}
