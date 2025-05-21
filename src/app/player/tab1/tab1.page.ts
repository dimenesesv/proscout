import { Component } from '@angular/core';
import { GeoPoint } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { getAuth } from 'firebase/auth';
import { GaleriaCardComponent } from 'src/app/shared/components/galeria-card.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  userData: Usuario = {}; // Datos del usuario logeado
  uid: string = '';

  pruebas = [
    { nombre: 'Velocidad 30m', estado: 'Pendiente', fecha: new Date() },
    { nombre: 'Control de balón', estado: 'Pendiente', fecha: new Date(new Date().setDate(new Date().getDate() + 3)) },
  ];

  jugadoresDestacados = [
    { nombre: 'Lucas Soto', club: 'Colo Colo Sub17', fotoUrl: 'https://via.placeholder.com/150' },
    { nombre: 'Matías Díaz', club: 'U de Chile Sub19', fotoUrl: 'https://via.placeholder.com/150' },
    { nombre: 'Cristóbal León', club: 'Everton Juvenil', fotoUrl: 'https://via.placeholder.com/150' },
  ];

  stats = {
    pruebasCompletadas: 5,
    porcentajePerfil: 80
  };

  tipDelDia = 'Recuerda calentar antes de cada prueba para evitar lesiones y rendir al máximo.';

  galleryUrls: string[] = [];
  uploadProgress: number | null = null;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.obtenerUserData();
    this.guardarUbicacionSiEsPosible();
  }

  async obtenerUserData() {
    const auth = getAuth();
    const user = auth.currentUser;
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
    const auth = getAuth();
    const user = auth.currentUser;
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

  selectImage() {
    // Implementa aquí la lógica de subida de imagen para el player si lo deseas
    alert('Función de subir imagen aún no implementada en player.');
  }
}
