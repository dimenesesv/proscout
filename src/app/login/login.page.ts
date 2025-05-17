import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate que el path sea correcto
import { Router } from '@angular/router'; // Para redirigir después de login
import { RegistroService } from 'src/app/services/registro.service';
import { FirebaseService } from 'src/app/services/firebase.service'; // Asegúrate que el path sea correcto
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router, private firebaseService: FirebaseService) {}

async login() {
  try {
    console.log('[DEBUG] Iniciando login con:', this.email);
    const userCredential = await this.authService.login(this.email, this.password);
    console.log('[DEBUG] Credencial:', userCredential);

    const uid = userCredential.user?.uid;
    if (!uid) throw new Error('No se pudo obtener el UID del usuario.');
    console.log('[DEBUG] UID:', uid);

    const path = `usuarios/${uid}`;
    console.log('[DEBUG] Path usado:', path);
    const userData = await this.firebaseService.getDocument(path);
    console.log('[DEBUG] Datos del usuario:', userData);

    if (userData) {
      if (userData.isplayer) {
        console.log('[DEBUG] Usuario es jugador');
        this.router.navigate(['/player/player/tab1']);
      } else if (userData.isscouter) {
        console.log('[DEBUG] Usuario es visor');
        this.router.navigate(['/scouter/scouter/mapa']);
      } else {
        console.warn('[DEBUG] Usuario sin rol definido');
        this.router.navigate(['/error']);
      }
    } else {
      console.warn('[DEBUG] No se encontraron datos del usuario');
      this.router.navigate(['/error']);
    }
  } catch (error) {
    console.error('[ERROR] Fallo en login:', error);
    alert('Ocurrió un error al iniciar sesión. Revisa tu conexión o credenciales.');
  }
}

  goToRegister() {
    this.router.navigate(['/registro']); // Redirige a la página de registro
  }
}