import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Scouter } from '../../interfaces/scouter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {
  jugadoresFavoritos: any[] = [];
  loading = false;
  timeoutId: any = null;

  constructor(
    public router: Router,
  ) {}

  async ngOnInit() {
    await this.cargarJugadoresFavoritos();
  }

  async ionViewWillEnter() {
    this.loading = true;
    // Timeout to hide loading after 7 seconds max
    this.timeoutId = setTimeout(() => {
      this.loading = false;
    }, 7000);
    await this.cargarJugadoresFavoritos();
    this.loading = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  async cargarJugadoresFavoritos() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('[FavoritosPage] No hay usuario autenticado');
      this.jugadoresFavoritos = [];
      return;
    }

    const db = getFirestore();
    const scouterRef = doc(db, 'usuarios', user.uid); // Cambiado de 'scouters' a 'usuarios'
    const scouterSnap = await getDoc(scouterRef);

    if (scouterSnap.exists()) {
      const data = scouterSnap.data() as any;
      // Acceso correcto: favoritos está en data.scouter.favoritos
      const favoritosIds: string[] = Array.isArray(data.scouter?.favoritos) ? data.scouter.favoritos : [];
      console.log('[FavoritosPage] IDs de favoritos:', favoritosIds);

      // Obtener datos de cada jugador favorito
      const jugadores: any[] = [];

      for (const uid of favoritosIds) {
        const jugadorRef = doc(db, 'playground', uid);
        const jugadorSnap = await getDoc(jugadorRef);
        if (jugadorSnap.exists()) {
          const jugadorData = jugadorSnap.data();
          console.log('[FavoritosPage] Datos jugador favorito:', uid, jugadorData);
          jugadores.push({ uid, ...jugadorData });
        } else {
          console.warn('[FavoritosPage] Jugador favorito no encontrado en usuarios:', uid);
        }
      }

      this.jugadoresFavoritos = jugadores;
      console.log('[FavoritosPage] jugadoresFavoritos final:', this.jugadoresFavoritos);
    } else {
      console.warn('[FavoritosPage] No existe documento scouter para UID:', user.uid);
      this.jugadoresFavoritos = [];
    }
  }

  verPerfil(jugadorUid: string) {
    // Redirige a la vista de perfil del jugador
    if (jugadorUid) {
      this.router.navigate([`/scouter/scouter/vista-perfil`, jugadorUid]);
    }
  }

  calcularEdad(fecha: string): number {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}
