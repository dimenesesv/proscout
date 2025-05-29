import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonContent, LoadingController } from '@ionic/angular';
import { AfterViewInit, HostListener } from '@angular/core';
import { calcularDistancia } from 'src/app/utils/distancia';
import { Geolocation } from '@capacitor/geolocation';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GeoPoint } from 'firebase/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Usuario } from 'src/app/interfaces/usuario';
import { VistaPerfilPage } from '../vista-perfil/vista-perfil.page';
import { ActivatedRoute } from '@angular/router';
declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false,
})
export class MapaPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  currentLocation: { lat: number; lng: number } = { lat: 19.4326, lng: -99.1332 }; // Default: CDMX
  users: Usuario[] = [];
  locationLabel: string = 'Mi ubicación';
  comuna: string = '';
  ciudad: string = '';
  isLoading: boolean = true;
  locationError: boolean = false;
  isRefreshing: boolean = false;

  // Infinite scroll: cargar más usuarios
  page = 1;
  pageSize = 20;
  pagedUsers: Usuario[] = [];

  private loadingRef: HTMLIonLoadingElement | null = null;

  constructor(
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private firebaseService: FirebaseService,
    private router: Router,
    private afAuth: AngularFireAuth, // <--- agregado
    private route: ActivatedRoute, // <--- inyectar ActivatedRoute
    private loadingController: LoadingController // <-- add LoadingController
  ) {}

  ngOnInit() {
    console.log('[MapaPage] ngOnInit');
    this.page = 1;
    this.pagedUsers = [];
    // Solo inicializaciones básicas aquí si es necesario
  }

  async ionViewWillEnter() {
    this.isLoading = true;
    this.resetMapaState();
    try {
      await this.guardarUbicacionSiEsPosible();
    } catch (e) {
      console.warn('[MapaPage] Error en guardarUbicacionSiEsPosible', e);
    }
    try {
      await this.getCurrentLocation();
    } catch (e) {
      console.warn('[MapaPage] Error en getCurrentLocation', e);
    }
    try {
      await this.loadUsers();
    } catch (e) {
      console.warn('[MapaPage] Error en loadUsers', e);
    }
    this.isLoading = false;
  }

  ionViewDidLeave() {
    this.cleanMapaResources();
    console.log('[MapaPage] ionViewDidLeave: recursos limpiados');
  }

  /**
   * Limpia el estado visual y de datos del mapa para evitar quedarse pegado
   */
  private resetMapaState() {
    this.users = [];
    this.comuna = '';
    this.ciudad = '';
    this.locationLabel = 'Mi ubicación';
    this.currentLocation = { lat: 19.4326, lng: -99.1332 };
    this.isLoading = true;
    this.locationError = false;
  }

  /**
   * Limpia recursos globales, listeners, timers, mapas, etc.
   */
  private cleanMapaResources() {
    this.users = [];
    // Limpia timers, listeners, mapas, etc. aquí si es necesario
  }

  async getCurrentLocation() {
    console.log('[MapaPage] getCurrentLocation INICIO');
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.locationLabel = 'Mi ubicación';
      await this.obtenerComunaCiudad(this.currentLocation.lat, this.currentLocation.lng);
      this.locationError = false;
      console.log('[MapaPage] getCurrentLocation OK', this.currentLocation);
    } catch (err) {
      console.warn('[MapaPage] ❌ Error al obtener ubicación:', err);
      this.locationError = true;
      // Si falla la ubicación, usa la ubicación predeterminada (CDMX)
    }
  }

  async loadUsers() {
    console.log('[MapaPage] loadUsers INICIO');
    try {
      // 1. Obtener UID del scouter autenticado
      const scouterUid = this.firebaseService.getCurrentUserUid && this.firebaseService.getCurrentUserUid();
      let favoritosIds: string[] = [];
      if (scouterUid) {
        const scouterDoc = await this.firebaseService.getDocument(`usuarios/${scouterUid}`);
        favoritosIds = Array.isArray(scouterDoc?.scouter?.favoritos) ? scouterDoc.scouter.favoritos : [];
        console.log('[MapaPage] Favoritos del scouter:', favoritosIds);
      }
      // 2. Obtener todos los usuarios
      const allUsers = await this.firebaseService.getCollection('playground');
      this.users = allUsers
        .filter((u: any) =>
          u.ubicacion &&
          typeof u.ubicacion.latitude === 'number' &&
          typeof u.ubicacion.longitude === 'number'
        )
        .map((u: any) => ({
          ...u,
          lat: u.ubicacion.latitude,
          lng: u.ubicacion.longitude,
          esFavorito: favoritosIds.includes(u.id || u.uid) // Marca si es favorito
        }));
      this.updateUserDistances();
      this.page = 1;
      this.updatePagedUsers();
      console.log('[MapaPage] loadUsers OK', this.users);
    } catch (e) {
      this.users = [];
      this.updateUserDistances();
      console.error('[MapaPage] loadUsers ERROR', e);
    }
  }

  updatePagedUsers() {
    this.pagedUsers = this.users.slice(0, this.page * this.pageSize);
  }

  loadMore(event: any) {
    this.page++;
    this.updatePagedUsers();
    setTimeout(() => {
      event.target.complete();
    }, 400);
  }

  async guardarUbicacionSiEsPosible() {
    console.log('[MapaPage] guardarUbicacionSiEsPosible INICIO');
    const user = await this.afAuth.currentUser;
    if (!user) {
      console.warn('[MapaPage] guardarUbicacionSiEsPosible: No user');
      return;
    }
    if (!navigator.geolocation) {
      console.warn('[MapaPage] guardarUbicacionSiEsPosible: No geolocation');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const ubicacion = new GeoPoint(position.coords.latitude, position.coords.longitude);
      try {
        await this.firebaseService.updateDocument(`usuarios/${user.uid}`, { ubicacion });
        // Obtener datos actuales del usuario
        const datos = await this.firebaseService.getDocument(`usuarios/${user.uid}`);
        if (datos && (!datos.comuna || !datos.ciudad || !datos.region || !datos.pais)) {
          // Llamar a la API de geocoding solo si falta algún campo
          const apiKey = 'AIzaSyB_FhkH1Co7ALNj_lVPO8EPAiBZ25BH45c'; // o usa environment.googleApiKey
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}&language=es`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === 'OK') {
            let comuna = '', ciudad = '', region = '', pais = '';
            const components = data.results[0]?.address_components || [];
            for (const comp of components) {
              if (comp.types.includes('locality')) ciudad = comp.long_name;
              if (comp.types.includes('administrative_area_level_3')) comuna = comp.long_name;
              if (comp.types.includes('administrative_area_level_1')) region = comp.long_name;
              if (comp.types.includes('country')) pais = comp.long_name;
            }
            await this.firebaseService.updateDocument(`usuarios/${user.uid}`, {
              comuna,
              ciudad,
              region,
              pais
            });
            console.log('[MapaPage] comuna/ciudad/region/pais guardados en Firestore', { comuna, ciudad, region, pais });
          }
        }
        console.log('[MapaPage] guardarUbicacionSiEsPosible OK');
      } catch (e) {
        console.warn('[MapaPage] guardarUbicacionSiEsPosible ERROR', e);
      }
    });
  }

  updateUserDistances() {
    console.log('[MapaPage] updateUserDistances INICIO', this.currentLocation, this.users);
    this.users = this.users
      .map((user) => ({
        ...user,
        distance: user.ubicacion && typeof user.ubicacion.latitude === 'number' && typeof user.ubicacion.longitude === 'number'
          ? calcularDistancia(
              this.currentLocation.lat,
              this.currentLocation.lng,
              user.ubicacion.latitude,
              user.ubicacion.longitude
            )
          : Infinity,
      }))
      .filter((user) => user.distance <= 500)
      .sort((a, b) => a.distance - b.distance);
    console.log('[MapaPage] updateUserDistances OK', this.users);
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async verPerfil(user: any) {
    console.log('[MapaPage] verPerfil', user);
    // Navega correctamente dentro del contexto de tabs
    this.router.navigate(['../vista-perfil', user.id], { relativeTo: this.route });
  }

  async doRefresh(event: any) {
    console.log('[MapaPage] doRefresh iniciado');
    let timeoutId: any;
    this.isRefreshing = true;
    try {
      await this.getCurrentLocation();
      console.log('[MapaPage] getCurrentLocation completado');
      await this.loadUsers();
      console.log('[MapaPage] loadUsers completado');
      event.target.complete();
    } catch (err) {
      console.error('[MapaPage] Error en doRefresh:', err);
      event.target.complete();
    } finally {
      this.isRefreshing = false;
      if (timeoutId) clearTimeout(timeoutId);
      console.log('[MapaPage] doRefresh finalizado');
    }
  }

  async presentUpdatingLoading() {
    this.dismissUpdatingLoading();
    this.loadingRef = await this.loadingController.create({
      message: '<div style="display:flex;align-items:center;justify-content:center;padding:0.5rem 0;"><ion-spinner name="crescent" style="width:32px;height:32px;"></ion-spinner></div>',
      cssClass: 'loading-toast-top',
      duration: 0,
      translucent: true,
      backdropDismiss: false,
      showBackdrop: false,
      keyboardClose: false,
      mode: 'ios',
      // @ts-ignore
      innerHTML: true
    });
    await this.loadingRef.present();
    // Mueve el loading a la parte superior como toast
    setTimeout(() => {
      const el = document.querySelector('.loading-toast-top .loading-wrapper, .loading-toast-top .loading-content');
      if (el) {
        (el as HTMLElement).style.top = '1.5rem';
        (el as HTMLElement).style.margin = '0 auto';
        (el as HTMLElement).style.position = 'fixed';
        (el as HTMLElement).style.left = '0';
        (el as HTMLElement).style.right = '0';
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.background = 'rgba(24,24,27,0.92)';
        (el as HTMLElement).style.borderRadius = '16px';
        (el as HTMLElement).style.boxShadow = '0 2px 16px 0 rgba(0,0,0,0.18)';
        (el as HTMLElement).style.width = 'auto';
        (el as HTMLElement).style.maxWidth = '180px';
        (el as HTMLElement).style.zIndex = '9999';
      }
    }, 10);
  }

  dismissUpdatingLoading() {
    if (this.loadingRef) {
      this.loadingRef.dismiss();
      this.loadingRef = null;
    }
  }

  async obtenerComunaCiudad(lat: number, lng: number) {
    console.log('[MapaPage] obtenerComunaCiudad INICIO', { lat, lng });
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleApiKey}&language=es`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('[MapaPage] obtenerComunaCiudad respuesta', data);
      if (data.status === 'OK') {
        let comuna = '';
        let ciudad = '';
        const components = data.results[0]?.address_components || [];
        for (const comp of components) {
          if (comp.types.includes('locality')) ciudad = comp.long_name;
          if (comp.types.includes('administrative_area_level_3')) comuna = comp.long_name;
        }
        this.comuna = comuna;
        this.ciudad = ciudad;
        console.log('[MapaPage] obtenerComunaCiudad OK', { comuna, ciudad });
      } else {
        this.comuna = '';
        this.ciudad = '';
        console.warn('[MapaPage] obtenerComunaCiudad: No se pudo obtener comuna/ciudad', data.status);
      }
    } catch (e) {
      this.comuna = '';
      this.ciudad = '';
      console.error('[MapaPage] obtenerComunaCiudad ERROR', e);
    }
  }

  getRows(arr: any[]): any[][] {
    const rows = [];
    for (let i = 0; i < arr.length; i += 2) {
      rows.push(arr.slice(i, i + 2));
    }
    return rows;
  }

  calcularEdad(fechaNacimiento: string): number | string {
    if (!fechaNacimiento) return '--';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  async abrirModalUbicacion() {
    const modal = await this.modalCtrl.create({
      component: (await import('./mapa-ubicacion-modal.component')).MapaUbicacionModalComponent,
      componentProps: {
        lat: this.currentLocation.lat,
        lng: this.currentLocation.lng
      },
      breakpoints: [0, 0.8],
      initialBreakpoint: 0.8,
      cssClass: 'mapa-ubicacion-modal',
    });
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.lat && result.data.lng) {
        this.currentLocation = { lat: result.data.lat, lng: result.data.lng };
        this.obtenerComunaCiudad(result.data.lat, result.data.lng);
        this.updateUserDistances();
      }
    });
    await modal.present();
  }

  ngAfterViewInit() {
    const contentEl = document.querySelector('ion-content');
    if (contentEl) {
      contentEl.addEventListener('ionScroll', this.handleScrollGlow.bind(this));
    }
    // Set initial glow
    this.setGlowBlur(18);
  }

  setGlowBlur(px: number) {
    const title = document.querySelector('.mapa-title') as HTMLElement;
    if (title) {
      title.style.setProperty('--glow-blur', `${px}px`);
    }
  }

  handleScrollGlow(event: any) {
    let scrollTop = 0;
    if (event && event.detail && typeof event.detail.scrollTop === 'number') {
      scrollTop = event.detail.scrollTop;
    }
    // Animate between 18px (top) and 4px (scrolled)
    const blur = Math.max(4, 18 - scrollTop / 8);
    this.setGlowBlur(blur);
  }
}