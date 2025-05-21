import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';
import { calcularDistancia } from 'src/app/utils/distancia';
import { Geolocation } from '@capacitor/geolocation';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GeoPoint } from 'firebase/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
declare var google: any;

interface User {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lng: number;
  distance?: number;
  // Add the following to match Usuario interface for perfil-card
  correo?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string;
  nacionalidad?: string;
  info?: any;
  tutor?: any;
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false,
})
export class MapaPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  currentLocation: { lat: number; lng: number } = { lat: 19.4326, lng: -99.1332 }; // Default: CDMX
  users: User[] = [];
  locationLabel: string = 'Mi ubicación';
  comuna: string = '';
  ciudad: string = '';

  constructor(private ngZone: NgZone, private modalCtrl: ModalController, private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    console.log('[MapaPage] ngOnInit');
    this.guardarUbicacionSiEsPosible();
    this.loadUsers();
    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    console.log('[MapaPage] getCurrentLocation INICIO');
    try {
      const position = await Geolocation.getCurrentPosition();
      this.ngZone.run(async () => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.locationLabel = 'Mi ubicación';
        await this.obtenerComunaCiudad(this.currentLocation.lat, this.currentLocation.lng);
        this.updateUserDistances();
        console.log('[MapaPage] getCurrentLocation OK', this.currentLocation);
      });
    } catch (err) {
      console.warn('[MapaPage] ❌ Error al obtener ubicación:', err);
      // Si falla la ubicación, usa la ubicación predeterminada (CDMX)
    }
  }

  async loadUsers() {
    console.log('[MapaPage] loadUsers INICIO');
    try {
      const allUsers = await this.firebaseService.getCollection('usuarios');
      // Filtra usuarios con ubicación válida (lat/lng numéricos) y agrega campos lat/lng
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
      console.log('[MapaPage] loadUsers OK', this.users);
      this.updateUserDistances();
    } catch (e) {
      this.users = [];
      this.updateUserDistances();
      console.error('[MapaPage] loadUsers ERROR', e);
    }
  }

  async guardarUbicacionSiEsPosible() {
    console.log('[MapaPage] guardarUbicacionSiEsPosible INICIO');
    const auth = await import('firebase/auth');
    const user = auth.getAuth().currentUser;
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
        distance: calcularDistancia(
          this.currentLocation.lat,
          this.currentLocation.lng,
          user.lat,
          user.lng
        ),
      }))
      .filter((user) => user.distance <= 500)
      .sort((a, b) => a.distance - b.distance);
    console.log('[MapaPage] updateUserDistances OK', this.users);
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  verPerfil(user: any) {
    console.log('[MapaPage] verPerfil', user);
    this.router.navigate(['/vista-perfil', user.id]);
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