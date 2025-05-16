import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Asegúrate que el path sea correcto
import { Router } from '@angular/router'; // Para redirigir después de login

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password)
      .then(userCredential => {
        console.log('Usuario logeado:', userCredential);
        this.router.navigate(['/player/tab1']); // Redirige a la página que quieras
      })
      .catch(error => {
        console.error('Error en login:', error);
        // Aquí podrías mostrar un mensaje de error
      });
  }
  goToRegister() {
    this.router.navigate(['/registro']); // Redirige a la página de registro
  }
}