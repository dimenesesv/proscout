import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RegistroService } from 'src/app/services/registro.service';

@Component({
  selector: 'app-correo',
  templateUrl: './correo.page.html',
  styleUrls: ['./correo.page.scss'],
  standalone: false,
})
export class CorreoPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private registroService: RegistroService,
    private router: Router
  ) {}

  async registrarCuenta() {
    try {
      // Crear cuenta en Firebase Auth
      const userCredential = await this.authService.register(this.email, this.password);

      // Guardar el correo en el servicio de registro
      this.registroService.setEmail(this.email);

      console.log('Cuenta creada:', userCredential);

      // Redirigir a la página de validación
      this.router.navigate(['/registro/validacion']);
    } catch (error) {
      console.error('Error al registrar la cuenta:', error);
      alert('Hubo un error al crear la cuenta. Por favor, intenta nuevamente.');
    }
  }
}