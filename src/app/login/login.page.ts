import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate que el path sea correcto
import { Router } from '@angular/router'; // Para redirigir después de login
import { RegistroService } from 'src/app/services/registro.service';
import { FirebaseService } from 'src/app/services/firebase.service'; // Asegúrate que el path sea correcto
import { Platform } from '@ionic/angular';
import { GeoPoint } from 'firebase/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private firebaseService: FirebaseService,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.guardarUbicacionSiEsPosible();
    });
  }

  async guardarUbicacionSiEsPosible() {
    const auth = await import('firebase/auth');
    const user = auth.getAuth().currentUser;
    if (!user) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      alert(`Latitud: ${position.coords.latitude}\nLongitud: ${position.coords.longitude}`);
      const ubicacion = new GeoPoint(position.coords.latitude, position.coords.longitude);
      try {
        await this.firebaseService.updateDocument(`usuarios/${user.uid}`, { ubicacion });
      } catch (e) {
        // Silenciar error, no es crítico
      }
    });
  }

  async login() {
    this.showError = false;
    try {
      const userCredential = await this.authService.login(this.email, this.password);

      const uid = userCredential.user?.uid;
      if (!uid) throw new Error('No se pudo obtener el UID del usuario.');

      const path = `usuarios/${uid}`;
      const userData = await this.firebaseService.getDocument(path);

      if (userData) {
        if (userData.esJugador) {
          this.router.navigate(['/player/player/tab1']);
        } else if (userData.esScouter) {
          this.router.navigate(['/scouter/scouter/mapa']);
        } else {
          this.router.navigate(['/error']);
        }
      } else {
        this.router.navigate(['/error']);
      }
    } catch (error: any) {
      this.showError = true;
      if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Formato de email inválido';
      } else if (error.code === 'auth/missing-password') {
        this.errorMessage = 'La contraseña es requerida';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Cuenta temporalmente bloqueada por muchos intentos fallidos';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente';
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/registro']); // Redirige a la página de registro
  }
}