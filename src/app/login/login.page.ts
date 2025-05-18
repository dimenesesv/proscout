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
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private firebaseService: FirebaseService) {}

  async login() {
    this.showError = false;
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
        if (userData.esJugador) {
          console.log('[DEBUG] Usuario es jugador');
          this.router.navigate(['/player/player/tab1']);
        } else if (userData.esScouter) {
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
    } catch (error: any) {
      console.error('Error completo:', error);
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