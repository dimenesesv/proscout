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

  async ionViewWillEnter() {
    await this.cargarJugadoresFavoritos();
  }

  async cargarJugadoresFavoritos() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    // Cambia aquí: lee desde la colección 'favoritos' en vez del documento scouter
    const favoritosRef = doc(db, 'favoritos', user.uid);
    const favoritosSnap = await getDoc(favoritosRef);

    let favoritosIds: string[] = [];
    if (favoritosSnap.exists()) {
      const data = favoritosSnap.data() as any;
      favoritosIds = Array.isArray(data.jugadores) ? data.jugadores : [];
    }

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
