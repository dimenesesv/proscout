import { Component } from '@angular/core';
import { GeoPoint } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GaleriaCardComponent } from 'src/app/shared/components/galeria-card.component';
import { Info } from 'src/app/interfaces/info';
import { Stats } from 'src/app/interfaces/stats';
import { HttpClient } from '@angular/common/http';
import { Consejo } from 'src/app/interfaces/consejo';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  userData: Usuario = {}; // Datos del usuario logeado
  uid: string = '';
  tipdeldia: string = 'Cargando consejo...';

  pruebas = [
    { nombre: 'Velocidad 30m', estado: 'Pendiente', fecha: new Date() },
    { nombre: 'Control de balón', estado: 'Pendiente', fecha: new Date(new Date().setDate(new Date().getDate() + 3)) },
  ];

  jugadoresDestacados: Usuario[] = [];

  stats = {
    pruebasCompletadas: 1,
    porcentajePerfil: 10
  };

  galleryUrls: string[] = [];
  uploadProgress: number | null = null;

  constructor(private firebaseService: FirebaseService, private afAuth: AngularFireAuth, private http : HttpClient) {}

  async ngOnInit() {
    await this.obtenerUserData();
    await this.guardarUbicacionSiEsPosible();
    await this.cargarJugadoresDestacados();
    await this.cargarConsejoDelDiaFirebase();
  }

  async obtenerUserData() {
    const user = await this.afAuth.currentUser;
    if (!user) return;

    this.uid = user.uid;

    try {
      const datos = await this.firebaseService.getDocument(`usuarios/${this.uid}`);
      if (datos) {
        this.userData = datos as Usuario; // sin usar generics para evitar TS2558
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  }

  async guardarUbicacionSiEsPosible() {
    const user = await this.afAuth.currentUser;
    if (!user || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const ubicacion = new GeoPoint(position.coords.latitude, position.coords.longitude);
      try {
        await this.firebaseService.updateDocument(`usuarios/${user.uid}`, { ubicacion });
      } catch (e) {
        // Silenciar error, no es crítico
      }
    });
  }

  // Copia de la lógica de busqueda.page.ts para mostrar los mejores jugadores por proximidad de stats
  async cargarJugadoresDestacados() {
    if (!this.userData || !this.userData.info?.posicion) {
      this.jugadoresDestacados = [];
      return;
    }
    const todos = await this.firebaseService.getCollection('playground');
    // Solo jugadores con la misma posición y que no sean el usuario actual
    const mismos = todos.filter((u: any) =>
      u.esJugador &&
      u.info?.posicion === this.userData.info?.posicion &&
      (u.uid === undefined ? u.id !== this.uid : u.uid !== this.uid)
    );
    // Simula filtros: busca los más parecidos al usuario logueado
    const filtros: Partial<Info & Stats> = { ...this.userData.info, ...this.userData.stats };
    const rango = 20;
    const statKeys = [
      'velocidad','resistencia','fuerza','agilidad','equilibrio','coordinacion','salto','controlBalon','regate','pase','tiro','cabeceo'
    ];
    const destacados = mismos.map((usuario: any) => {
      let puntaje = 0;
      let total = 0;
      // Altura
      if (filtros.altura && usuario.info?.altura) {
        let alturaUsuario = usuario.info.altura;
        if (alturaUsuario < 3) alturaUsuario = alturaUsuario * 100;
        const diff = Math.abs(filtros.altura - alturaUsuario);
        if (diff <= rango) puntaje += (rango - diff);
        total += rango;
      }
      // Peso
      if (filtros.peso && usuario.info?.peso) {
        const diff = Math.abs(filtros.peso - usuario.info.peso);
        if (diff <= rango) puntaje += (rango - diff);
        total += rango;
      }
      // Edad
      let edadCalculada: number | undefined = undefined;
      if (usuario.fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(usuario.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        edadCalculada = edad;
        if (filtros.edad) {
          const diff = Math.abs(filtros.edad - edad);
          if (diff <= rango) puntaje += (rango - diff);
          total += rango;
        }
      }
      // Stats
      for (const key of statKeys) {
        const valorFiltro = (filtros as any)[key];
        if (
          valorFiltro !== undefined && valorFiltro !== null &&
          usuario.stats && usuario.stats[key] !== undefined && usuario.stats[key] !== null
        ) {
          const diff = Math.abs((valorFiltro as number) - (usuario.stats[key] as number));
          if (diff <= rango) puntaje += (rango - diff);
          total += rango;
        }
      }
      const porcentaje = total > 0 ? Math.round((puntaje / total) * 100) : 0;
      return { usuario, puntaje: total > 0 ? puntaje : 0, porcentaje, edadCalculada };
    })
    .filter(r => r.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje);
    // Solo los 3 mejores
    this.jugadoresDestacados = destacados.slice(0, 3).map(d => d.usuario);
  }

  selectImage() {
    // Implementa aquí la lógica de subida de imagen para el player si lo deseas
    alert('Función de subir imagen aún no implementada en player.');
  }

  calcularEdad(fechaNacimiento?: string): number | string {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
  cargarConsejoDelDia() {
    this.http.get<string[]>('assets/consejos-futbol.json').subscribe(consejos => {
      const hoy = new Date();
      const diaDelAno = Math.floor(
        (hoy.getTime() - new Date(hoy.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
      );
      this.tipdeldia = consejos[diaDelAno % consejos.length];
    });
  }
  async cargarConsejoDelDiaFirebase() {
    try {
      // Obtiene todos los consejos de la colección 'consejos'
      const consejos = await this.firebaseService.getCollection('consejos');
      console.log('[Consejo] Consejos obtenidos de Firebase:', consejos);
      // Adaptar si los documentos tienen la estructura {1: {fecha, texto}, id: ...}
      const consejosAdaptados = consejos.map((c: any) => {
        if (c[1] && typeof c[1] === 'object') {
          return { fecha: c[1].fecha, texto: c[1].texto };
        }
        return c;
      });
      if (consejosAdaptados && consejosAdaptados.length > 0) {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10); // 'YYYY-MM-DD'
        console.log('[Consejo] Fecha de hoy:', hoyStr);
        let consejoHoy = consejosAdaptados.find((c: any) => c.fecha === hoyStr);
        console.log('[Consejo] Consejo encontrado para hoy:', consejoHoy);
        if (!consejoHoy) {
          const random = consejosAdaptados[Math.floor(Math.random() * consejosAdaptados.length)];
          console.log('[Consejo] Consejo aleatorio seleccionado:', random);
          this.tipdeldia = random.texto;
        } else {
          this.tipdeldia = consejoHoy.texto;
        }
        console.log('[Consejo] Consejo final mostrado:', this.tipdeldia);
      } else {
        this.tipdeldia = 'No hay consejos disponibles';
        console.warn('[Consejo] No hay consejos disponibles en la colección');
      }
    } catch (error) {
      this.tipdeldia = 'Error al cargar el consejo';
      console.error('[Consejo] Error al cargar el consejo:', error);
    }
  }

}
