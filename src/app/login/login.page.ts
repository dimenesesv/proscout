import { Component, AfterViewInit } from '@angular/core';
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
export class LoginPage implements AfterViewInit {
  email: string = '';
  password: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private firebaseService: FirebaseService,
    private platform: Platform
  ) {}

  async login() {
    try {
      await this.authService.loginAndRedirect(this.email, this.password, this.firebaseService);
    } catch (error: any) {
      this.showError = true;
      console.error('[LoginPage] Error en login:', error);
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

  async ngAfterViewInit() {
    // Motion One animation for login card
    const motion = await import('@motionone/dom');
    const card = document.querySelector('.login-card');
    if (card) {
      motion.animate(card, { opacity: [0, 1], y: [40, 0] }, { duration: 0.7, easing: 'ease-out' });
    }
  }
}