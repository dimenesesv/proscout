import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';
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

  constructor(private ngZone: NgZone, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadUsers(); // Simulando usuarios
    this.getCurrentLocation();
  }

  ngAfterViewInit() {
    this.loadMap(); // Llamar para inicializar el mapa una vez se haya cargado la vista
  }

  async getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.ngZone.run(() => {
            this.currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.locationLabel = 'Mi ubicación';
            this.loadMap();
            this.updateUserDistances(); // Actualiza la distancia de los usuarios con la nueva ubicación
          });
        },
        (err) => {
          // Si falla la ubicación, se usa la ubicación predeterminada (CDMX)
        }
      );
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

  loadUsers() {
    // Aquí podrías hacer una llamada real a tu API de usuarios, pero por ahora usamos datos estáticos
    this.users = [
      {
        id: '1',
        name: 'Ana',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        lat: 19.4327,
        lng: -99.1331,
      },
      {
        id: '2',
        name: 'Luis',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        lat: 19.435,
        lng: -99.14,
      },
      {
        id: '3',
        name: 'Sofía',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        lat: 19.43,
        lng: -99.12,
      },
    ];
    this.updateUserDistances();
  }

  updateUserDistances() {
    this.users = this.users.map((user) => ({
      ...user,
      distance: this.getDistanceFromLatLonInKm(
        this.currentLocation.lat,
        this.currentLocation.lng,
        user.lat,
        user.lng
      ),
    }));
    this.addUserMarkers();
  }

  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
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
}