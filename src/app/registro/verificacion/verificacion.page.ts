import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { RegistroService } from 'src/app/services/registro.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verificacion',
  templateUrl: './verificacion.page.html',
  styleUrls: ['./verificacion.page.scss'],
  standalone: false,
})
export class VerificacionPage implements OnInit {
  email: string = '';
  isCheckingVerification: boolean = false;

  constructor(
    private authService: AuthService,
    private registroService: RegistroService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el correo del servicio de registro
    this.email = this.registroService.getEmail() || '';

    // Iniciar la verificación periódica
    this.checkEmailVerification();
  }

  async reenviarCorreo() {
    try {
      await this.authService.sendEmailVerification();
      alert('Correo de verificación reenviado.');
    } catch (error) {
      console.error('Error al reenviar el correo de verificación:', error);
      alert('Hubo un error al reenviar el correo. Por favor, intenta nuevamente.');
    }
  }

  async checkEmailVerification() {
    this.isCheckingVerification = true;
    const interval = setInterval(async () => {
      const user = await this.authService.getCurrentUser();
      if (user?.emailVerified) {
        clearInterval(interval); // Detener la verificación periódica
        this.isCheckingVerification = false;
        this.router.navigate(['/registro/siguiente-pagina']); // Redirigir a la siguiente página
      }
    }, 3000); // Verificar cada 3 segundos
  }

  continuar() {
    this.router.navigate(['/registro/bienvenida']); // Redirigir manualmente
  }
}