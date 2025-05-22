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

  constructor() {}

  async ngOnInit() {
    await this.cargarJugadoresFavoritos();
  }

  async cargarJugadoresFavoritos() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const scouterRef = doc(db, 'scouters', user.uid);
    const scouterSnap = await getDoc(scouterRef);

    if (scouterSnap.exists()) {
      const data = scouterSnap.data() as Scouter;
      const favoritosIds: string[] = Array.isArray(data.favoritos) ? data.favoritos : [];

      // Obtener datos de cada jugador favorito
      const jugadores: any[] = [];

      for (const uid of favoritosIds) {
        const jugadorRef = doc(db, 'usuarios', uid);
        const jugadorSnap = await getDoc(jugadorRef);
        if (jugadorSnap.exists()) {
          jugadores.push({ uid, ...jugadorSnap.data() });
        }
      }

      this.jugadoresFavoritos = jugadores;
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
