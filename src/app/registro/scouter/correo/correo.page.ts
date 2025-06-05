import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RegistroService } from 'src/app/services/registro.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-correo',
  templateUrl: './correo.page.html',
  styleUrls: ['./correo.page.scss'],
  standalone: false,
})
export class CorreoPage {
  email: string = '';
  password: string = '';
  password2: string = '';
  passwordError: string = '';

  constructor(
    private authService: AuthService,
    private registroService: RegistroService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  validarPassword(): boolean {
    // Reglas: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(this.password)) {
      this.passwordError = 'La contraseña no cumple con las reglas de seguridad.';
      return false;
    }
    if (this.password !== this.password2) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  async registrarCuenta() {
    if (!this.validarPassword()) {
      return;
    }

    try {
      // Crear cuenta en Firebase Auth
      const userCredential = await this.authService.register(this.email, this.password);

      // Guardar el correo en el servicio de registro
      this.registroService.setCorreo(this.email);

      // Obtener el UID del usuario creado
      const uid = userCredential.user?.uid;

      if (uid) {
        // Guardar los datos del usuario en Firestore
        const usuario = this.registroService.getUsuario(); // Obtener los datos del usuario
        await this.firebaseService.setDocument(`usuarios/${uid}`, usuario);

        console.log('Usuario registrado y datos guardados en Firestore:', usuario);

        // Redirigir a la página de confirmación de correo
        this.router.navigate(['/registro/verificacion']);
      } else {
        throw new Error('No se pudo obtener el UID del usuario.');
      }
    } catch (error) {
      console.error('Error al registrar la cuenta:', error);
      alert('Hubo un error al crear la cuenta. Por favor, intenta nuevamente.');
    }
  }
}