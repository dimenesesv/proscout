import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';
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
export class MapaPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  currentLocation: { lat: number; lng: number } = { lat: 19.4326, lng: -99.1332 }; // Default: CDMX
  users: Usuario[] = [];
  locationLabel: string = 'Mi ubicación';
  comuna: string = '';
  ciudad: string = '';
  isLoading: boolean = true;

  constructor(
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private firebaseService: FirebaseService,
    private router: Router,
    private afAuth: AngularFireAuth, // <--- agregado
    private route: ActivatedRoute // <--- inyectar ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('[MapaPage] ngOnInit');
    // Solo inicializaciones básicas aquí si es necesario
  }

  async ionViewWillEnter() {
    this.isLoading = true;
    console.log('[MapaPage] ionViewWillEnter');
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
    // Limpia recursos, listeners, timers, etc. si es necesario
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
    // Si usas Google Maps, destruye el mapa aquí si es necesario
    // Si usas otros recursos visuales, reinícialos aquí
  }

  /**
   * Limpia recursos globales, listeners, timers, mapas, etc.
   */
  private cleanMapaResources() {
    this.users = [];
    // Si tienes timers globales, límpialos aquí
    // Si usas listeners de mapas, remuévelos aquí
    // Si usas Swiper u otros plugins, destrúyelos aquí
    // Si usas Google Maps, destrúyelo aquí
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
      console.log('[MapaPage] getCurrentLocation OK', this.currentLocation);
    } catch (err) {
      console.warn('[MapaPage] ❌ Error al obtener ubicación:', err);
      // Si falla la ubicación, usa la ubicación predeterminada (CDMX)
    }
  }

  async loadUsers() {
    console.log('[MapaPage] loadUsers INICIO');
    try {
      const allUsers = await this.firebaseService.getCollection('usuarios');
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
        }));
      this.updateUserDistances();
      console.log('[MapaPage] loadUsers OK', this.users);
    } catch (e) {
      this.users = [];
      this.updateUserDistances();
      console.error('[MapaPage] loadUsers ERROR', e);
    }
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
    try {
      timeoutId = setTimeout(() => {
        console.warn('[MapaPage] doRefresh: Timeout alcanzado, forzando complete');
        event.target.complete();
      }, 7000);
      await this.getCurrentLocation();
      console.log('[MapaPage] getCurrentLocation completado');
      await this.loadUsers();
      console.log('[MapaPage] loadUsers completado');
      event.target.complete();
      console.log('[MapaPage] event.target.complete() ejecutado');
    } catch (err) {
      console.error('[MapaPage] Error en doRefresh:', err);
      event.target.complete();
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      console.log('[MapaPage] doRefresh finalizado');
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
    for (let i = 0; i < arr.length; i += 3) {
      rows.push(arr.slice(i, i + 3));
    }
    return rows;
  }
}