import { Component, OnInit, OnDestroy } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit, OnDestroy {
  favoritosCount: number = 0;
  perfilCompleto: boolean = false;
  fotosCount: number = 0;
  primerVideoSubido: boolean = false;

  showFavoritosProgreso: boolean = false;
  showPerfilProgreso: boolean = false;
  showFotosProgreso: boolean = false;
  showVideoProgreso: boolean = false;

  objetivos = [
    { texto: 'Añade 10 jugadores a favoritos', completado: false },
    { texto: 'Completa tu perfil', completado: false },
    { texto: 'Sube 3 fotos', completado: false },
    { texto: 'Sube tu primer video', completado: false },
  ];

  trofeos = {
    favoritos: false,
    perfil: false,
    fotos: false,
    video: false,
  };

  private userUnsubscribe: (() => void) | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    await this.listenUserRealtime();
  }

  ngOnDestroy() {
    if (this.userUnsubscribe) this.userUnsubscribe();
  }

  async listenUserRealtime() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, 'usuarios', user.uid);
    this.userUnsubscribe = onSnapshot(userRef, (userSnap) => {
      if (userSnap.exists()) {
        const data: any = userSnap.data();
        this.favoritosCount = Array.isArray(data.favoritos) ? data.favoritos.length : 0;
        this.perfilCompleto = this.verificarPerfilCompleto(data);
        this.fotosCount = Array.isArray(data.fotos) ? data.fotos.length : 0;
        this.primerVideoSubido = Array.isArray(data.videos) && data.videos.length > 0;
        this.verificarObjetivos();
      }
    });
  }

  verificarPerfilCompleto(data: any): boolean {
    return !!(
      data.nombre &&
      data.apellido &&
      data.fechaNacimiento &&
      data.nacionalidad &&
      data.posicion &&
      data.fotoPerfil
    );
  }

  verificarObjetivos() {
    this.objetivos[0].completado = this.favoritosCount >= 10;
    this.objetivos[1].completado = this.perfilCompleto;
    this.objetivos[2].completado = this.fotosCount >= 3;
    this.objetivos[3].completado = this.primerVideoSubido;
    this.trofeos.favoritos = this.favoritosCount >= 10;
    this.trofeos.perfil = this.perfilCompleto;
    this.trofeos.fotos = this.fotosCount >= 3;
    this.trofeos.video = this.primerVideoSubido;
  }

  get porcentajeFavoritos(): number {
    return Math.min(100, Math.round((this.favoritosCount / 10) * 100));
  }
  get porcentajePerfil(): number {
    return this.perfilCompleto ? 100 : 0;
  }
  get porcentajeFotos(): number {
    return Math.min(100, Math.round((this.fotosCount / 3) * 100));
  }
  get porcentajeVideo(): number {
    return this.primerVideoSubido ? 100 : 0;
  }

  // Métodos para mostrar/ocultar progreso al hacer click en la card
  toggleFavoritosProgreso() {
    this.showFavoritosProgreso = !this.showFavoritosProgreso;
  }
  togglePerfilProgreso() {
    this.showPerfilProgreso = !this.showPerfilProgreso;
  }
  toggleFotosProgreso() {
    this.showFotosProgreso = !this.showFotosProgreso;
  }
  toggleVideoProgreso() {
    this.showVideoProgreso = !this.showVideoProgreso;
  }

  get progress(): number {
    return this.objetivos.filter(o => o.completado).length / this.objetivos.length;
  }

  irASeccion(seccion: string) {
    switch (seccion) {
      case 'galeria':
        this.router.navigate(['../tab4'], {
          relativeTo: this.route,
          queryParams: { tab: 2, autoOpen: true }
        });
        break;
      case 'perfil':
        this.router.navigate(['../tab1'], { relativeTo: this.route });
        break;
      case 'video':
        this.router.navigate(['../tab4'], {
          relativeTo: this.route,
          queryParams: { tab: 2, autoOpen: true, video: true }
        });
        break;
      case 'favoritos':
        this.router.navigate(['../tab3'], { relativeTo: this.route });
        break;
      default:
        break;
    }
  }
}