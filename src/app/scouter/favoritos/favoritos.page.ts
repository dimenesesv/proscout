import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Scouter } from '../../interfaces/scouter';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {
  jugadoresFavoritos: any[] = [];
  loading = false;
  mostrarCancha = false;
  timeoutId: any = null;

  jugadoresPorPosicion: { [posicion: string]: any[] } = {};
  jugadoresActivosEnCancha: { [posicion: string]: any | null } = {};

  modalAbierto = false;
  posicionSeleccionada: string = '';

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
    let userUid: string | undefined;
    // Usar el método multiplataforma del servicio
    // (Requiere que FirebaseService esté disponible aquí, si no, importar y usar correctamente)
    try {
      const { FirebaseService } = await import('src/app/services/firebase.service');
      const firebaseService = new FirebaseService(undefined as any); // Si tienes inyección, usa DI
      const uid = await firebaseService.getCurrentUserUid();
      userUid = uid === null ? undefined : uid;
    } catch (e) {
      console.error('[FavoritosPage] Error obteniendo UID:', e);
      userUid = undefined;
    }
    if (!userUid) {
      console.warn('[FavoritosPage] No hay usuario autenticado');
      this.jugadoresFavoritos = [];
      return;
    }

    const db = getFirestore();
    const scouterRef = doc(db, 'usuarios', userUid); // Cambiado de 'scouters' a 'usuarios'
    const scouterSnap = await getDoc(scouterRef);

    if (scouterSnap.exists()) {
      const data = scouterSnap.data() as any;
      const favoritosIds: string[] = Array.isArray(data.scouter?.favoritos) ? data.scouter.favoritos : [];
      console.log('[FavoritosPage] IDs de favoritos:', favoritosIds);

      // Obtener datos de cada jugador favorito
      const jugadores: any[] = [];

      for (const uid of favoritosIds) {
        const jugadorRef = doc(db, 'usuarios', uid);
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
      // DEBUG: Mostrar en UI si el array está vacío
      if (jugadores.length === 0) {
        console.warn('[FavoritosPage] ¡No se encontraron datos de jugadores favoritos!');
      }

      this.jugadoresPorPosicion = {};
      this.jugadoresActivosEnCancha = {};

      for (const jugador of jugadores) {
        const posicion = jugador.info?.posicion;
        if (!posicion) continue;

        if (!this.jugadoresPorPosicion[posicion]) {
          this.jugadoresPorPosicion[posicion] = [];
        }
        this.jugadoresPorPosicion[posicion].push(jugador);
      }

      for (const posicion in this.jugadoresPorPosicion) {
        this.jugadoresActivosEnCancha[posicion] = this.jugadoresPorPosicion[posicion];
      }
    } else {
      console.warn('[FavoritosPage] No existe documento scouter para UID:', userUid);
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

  cambiarJugadorEnCancha(posicion: string, nuevoJugadorUid: string) {
    const candidatos = this.jugadoresPorPosicion[posicion];
    if (!candidatos) {
      console.warn('[FavoritosPage] No hay candidatos para la posición', posicion);
      return;
    }
    const nuevo = candidatos.find(j => j.uid === nuevoJugadorUid);
    if (nuevo) {
      this.jugadoresActivosEnCancha[posicion] = nuevo;
      console.log('[FavoritosPage] Jugador seleccionado para', posicion, ':', nuevo);
    } else {
      console.warn('[FavoritosPage] No se encontró el jugador con UID', nuevoJugadorUid, 'en', candidatos);
    }
  }

  seleccionarJugador(posicion: string) {
    this.posicionSeleccionada = posicion;
    this.modalAbierto = true;
    console.log('[FavoritosPage] Modal abierto para posición:', posicion, 'Candidatos:', this.jugadoresPorPosicion[posicion]);
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.posicionSeleccionada = '';
  }

  async agregarJugadorBusqueda(posicion: string) {
    this.cerrarModal();
    setTimeout(() => {
      this.router.navigate(['/scouter/scouter/busqueda']);
    }, 200);
  }
}
