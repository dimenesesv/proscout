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

  constructor(
    private authService: AuthService,
    private registroService: RegistroService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async registrarCuenta() {
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

        // Subir documento de tutor legal si existe
        if (this.registroService.archivoTutorLegal) {
          try {
            const ext = this.registroService.nombreArchivoTutorLegal.split('.').pop();
            const path = `usuarios/${uid}/documents/tutor-legal.${ext}`;
            // Importa StorageService dinámicamente para evitar dependencias circulares
            const { StorageService } = await import('src/app/services/storage.service');
            const storageService = new StorageService();
            const url = await storageService.uploadImageAndGetUrl(path, this.registroService.archivoTutorLegal);
            await this.firebaseService.updateDocument(`usuarios/${uid}`, { 'tutor.documentoUrl': url });
            console.log('Documento de tutor legal subido y URL guardada:', url);
          } catch (err) {
            console.error('Error al subir documento de tutor legal:', err);
            alert('El registro fue exitoso, pero hubo un problema al subir el documento del tutor legal. Puedes intentarlo más tarde en tu perfil.');
          }
        }

        // Redirigir a la página de confirmación de correo
        this.router.navigate(['/registro/jugador/verificacion']);
      } else {
        throw new Error('No se pudo obtener el UID del usuario.');
      }
    } catch (error) {
      console.error('Error al registrar la cuenta:', error);
      alert('Hubo un error al crear la cuenta. Por favor, intenta nuevamente.');
    }
  }

  validarPassword(pwd: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8;
  }
}