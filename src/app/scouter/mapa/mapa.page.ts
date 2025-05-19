import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';
import { calcularDistancia } from 'src/app/utils/distancia';
import { Geolocation } from '@capacitor/geolocation';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GeoPoint } from 'firebase/firestore';
import { Router } from '@angular/router';
declare var google: any;

interface User {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lng: number;
  distance?: number;
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false,
})
export class MapaPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  map: any;
  currentLocation: { lat: number; lng: number } = { lat: 19.4326, lng: -99.1332 }; // Default: CDMX
  users: User[] = [];
  markers: any[] = [];
  locationLabel: string = 'Mi ubicación';

  constructor(private ngZone: NgZone, private modalCtrl: ModalController, private firebaseService: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.guardarUbicacionSiEsPosible();
    this.loadUsers(); // Simulando usuarios
    this.getCurrentLocation();
  }

  ngAfterViewInit() {
    this.loadMap(); // Llamar para inicializar el mapa una vez se haya cargado la vista
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.ngZone.run(() => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.locationLabel = 'Mi ubicación';
        this.loadMap();
        this.updateUserDistances(); // Actualiza la distancia de los usuarios con la nueva ubicación
      });
    } catch (err) {
      console.warn('[MapaPage] ❌ Error al obtener ubicación:', err);
      // Si falla la ubicación, usa la ubicación predeterminada (CDMX)
    }
  }

  loadMap() {
    if (typeof google === 'undefined' || !google.maps) return;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    this.map = new google.maps.Map(mapEl, {
      center: this.currentLocation,
      zoom: 13,
      disableDefaultUI: true,
    });
    this.addCurrentLocationMarker(); // Marca la ubicación actual
  }

  addCurrentLocationMarker() {
    if (!this.map) return;
    new google.maps.Marker({
      position: this.currentLocation,
      map: this.map,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      },
      title: 'Tu ubicación',
    });
  }

  async loadUsers() {
    try {
      // Obtener todos los usuarios reales de Firestore
      const { collection, getDocs } = await import('@angular/fire/firestore');
      const firestore = (this.firebaseService as any).firestore;
      const usuariosCol = collection(firestore, 'usuarios');
      const snapshot = await getDocs(usuariosCol);
      const auth = await import('firebase/auth');
      const currentUser = auth.getAuth().currentUser;
      this.users = snapshot.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) =>
          u.ubicacion &&
          typeof u.ubicacion.latitude === 'number' &&
          typeof u.ubicacion.longitude === 'number' &&
          u.esJugador === true && // Solo jugadores
          (!currentUser || u.id !== currentUser.uid)
        )
        .map((u: any) => ({
          id: u.id,
          name: u.nombre || u.correo || 'Usuario',
          avatar: u.fotoPerfil || 'https://randomuser.me/api/portraits/lego/1.jpg',
          lat: u.ubicacion.latitude,
          lng: u.ubicacion.longitude,
        }));
      this.updateUserDistances();
    } catch (e) {
      // Si falla, no mostrar usuarios
      this.users = [];
      this.updateUserDistances();
    }
  }

  async guardarUbicacionSiEsPosible() {
    const auth = await import('firebase/auth');
    const user = auth.getAuth().currentUser;
    if (!user) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const ubicacion = new GeoPoint(position.coords.latitude, position.coords.longitude);
      try {
        await this.firebaseService.updateDocument(`usuarios/${user.uid}`, { ubicacion });
      } catch (e) {
        // Silenciar error, no es crítico
      }
    });
  }

  updateUserDistances() {
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
      .filter((user) => user.distance <= 50); // Solo usuarios a 50km o menos
    this.addUserMarkers();
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  addUserMarkers() {
    if (!this.map) return;
    this.markers.forEach((m) => m.setMap(null));
    this.markers = [];
    this.users.forEach((user) => {
      const marker = new google.maps.Marker({
        position: { lat: user.lat, lng: user.lng },
        map: this.map,
        title: user.name,
        icon: {
          url: user.avatar,
          scaledSize: new google.maps.Size(40, 40),
        },
      });
      marker.addListener('click', () => {
        this.focusUser(user);
      });
      this.markers.push(marker);
    });
  }

  focusUser(user: User) {
    if (this.map) {
      this.map.panTo({ lat: user.lat, lng: user.lng });
      this.map.setZoom(15);
    }
  }

  verPerfil(user: any) {
    this.router.navigate(['/vista-perfil', user.id]);
  }
}