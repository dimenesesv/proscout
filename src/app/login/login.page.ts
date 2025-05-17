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
      const userCredential = await this.authService.login(this.email, this.password);
      console.log('Usuario logeado:', userCredential);
      const uid = userCredential.user?.uid;
      alert('UID obtenido: ' + uid);
      if (!uid) {
        throw new Error('No se pudo obtener el UID del usuario.');
      }
      console.log('[DEBUG] UID:', uid);
      const path = `usuarios/${uid}`;
      console.log('[DEBUG] Path usado:', path);
      const userData = await this.firebaseService.getDocument(path);
      console.log('[DEBUG] userData:', userData);
      if (userData) {
        if (userData.isplayer) {
          this.router.navigate(['/player/tabs/tab1']);
        } else if (userData.isscouter) {
          this.router.navigate(['/scouter/tabs/mapa']);
        } else {
          this.router.navigate(['/error']);
        }
      } else {
        this.router.navigate(['/error']);
      }
    } catch (error) {
      console.error('Error en login:', error);
      // Aquí podrías mostrar un mensaje de error
    }
  }

  goToRegister() {
    this.router.navigate(['/registro']); // Redirige a la página de registro
  }
}