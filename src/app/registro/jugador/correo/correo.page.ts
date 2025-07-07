import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RegistroService } from 'src/app/services/registro.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AlertController } from '@ionic/angular';

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
  aceptaTerminos: boolean = false;
  aceptaPrivacidad: boolean = false;

  constructor(
    private authService: AuthService,
    private registroService: RegistroService,
    private firebaseService: FirebaseService,
    private router: Router,
    private alertController: AlertController
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

  async mostrarTerminos() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h3>TÉRMINOS Y CONDICIONES DE USO – PROSCOUT</h3>
          
          <h4>1. ACEPTACIÓN DEL USUARIO</h4>
          <p>Al registrarse y utilizar la aplicación ProScout, el usuario declara haber leído, comprendido y aceptado plenamente estos Términos y Condiciones.<br>
          Si el usuario es menor de 18 años, el registro debe ser autorizado y acompañado por su tutor legal, quien también acepta este documento en representación del menor.</p>
          
          <h4>2. DEFINICIONES</h4>
          <p>- Plataforma: Aplicación móvil y web llamada ProScout.<br>
          - Usuario: Persona que se registra en la app, ya sea como Jugador o Scouter.<br>
          - Jugador: Usuario menor o mayor de edad que crea un perfil para mostrar sus habilidades deportivas.<br>
          - Scouter: Usuario que utiliza la app con fines de búsqueda, contacto o análisis de jugadores.<br>
          - Tutor Legal: Persona adulta responsable que autoriza y supervisa el uso de ProScout por parte del menor.<br>
          - ProScout SpA: Empresa responsable del desarrollo y operación de la plataforma.</p>
          
          <h4>3. REGISTRO Y AUTENTICACIÓN</h4>
          <p>- El usuario debe registrarse proporcionando datos reales y verificables.<br>
          - ProScout validará la información personal y el RUT chileno.<br>
          - Los jugadores menores de edad deben ingresar obligatoriamente los datos completos de su tutor legal.<br>
          - ProScout se reserva el derecho de rechazar o eliminar registros con datos falsos o no autorizados.</p>
          
          <h4>4. PROTECCIÓN DE MENORES</h4>
          <p>- Los perfiles de jugadores menores están protegidos por una capa adicional de seguridad.<br>
          - El tutor legal tiene derecho a:<br>
            • Revisar la actividad del menor.<br>
            • Revocar el consentimiento en cualquier momento.<br>
            • Solicitar la eliminación total del perfil y los datos asociados.<br>
          - ProScout no permite contacto sin consentimiento entre adultos y menores fuera del entorno controlado de la plataforma.<br>
          - Cualquier conducta sospechosa será reportada y sancionada, incluyendo el bloqueo inmediato de la cuenta.</p>
          
          <h4>5. PRIVACIDAD Y USO DE DATOS</h4>
          <p>- Los datos personales ingresados son confidenciales y tratados según la Ley 19.628 de Protección de la Vida Privada (Chile).<br>
          - ProScout no compartirá información con terceros sin consentimiento.<br>
          - Los usuarios aceptan el uso de sus datos para:<br>
            • Mostrar perfiles dentro de la plataforma.<br>
            • Calcular métricas y estadísticas deportivas.<br>
            • Mejorar la experiencia de usuario (UX).<br>
          - Los datos pueden ser eliminados a solicitud del usuario o tutor legal.</p>
          
          <h4>6. CONDICIONES DE USO DE LA PLATAFORMA</h4>
          <p>- Los jugadores deben utilizar la app exclusivamente para mostrar su perfil deportivo.<br>
          - Los scouters deben usarla únicamente con fines de búsqueda y contacto profesional.<br>
          - No está permitido:<br>
            • Enviar contenido ofensivo, violento o inapropiado.<br>
            • Usar la app para fines comerciales no autorizados.<br>
            • Crear cuentas falsas o suplantar identidad.<br>
          - ProScout se reserva el derecho de suspender o eliminar cuentas que incumplan estas reglas.</p>
          
          <h4>7. PROPIEDAD INTELECTUAL</h4>
          <p>- Todo el contenido, diseño, código fuente, imágenes y funcionalidades de ProScout pertenecen a ProScout SpA.<br>
          - El usuario no puede copiar, modificar ni distribuir ningún contenido sin autorización escrita.</p>
          
          <h4>8. LIMITACIÓN DE RESPONSABILIDAD</h4>
          <p>- ProScout no garantiza que se establezcan vínculos profesionales entre jugadores y scouters.<br>
          - La app es una herramienta de visibilización, no un intermediario entre partes.<br>
          - ProScout no se hace responsable por interacciones fuera de la plataforma.<br>
          - Los usuarios aceptan que utilizan la app bajo su propia responsabilidad.</p>
          
          <h4>9. MODIFICACIONES A LOS TÉRMINOS</h4>
          <p>ProScout puede actualizar estos Términos y Condiciones en cualquier momento.<br>
          Se notificará a los usuarios sobre los cambios relevantes y se solicitará su aceptación si corresponde.</p>
          
          <h4>10. CONTACTO Y SOPORTE</h4>
          <p>Para consultas legales, eliminación de datos, denuncias o solicitudes de tutor legal, puedes contactarnos a:<br>
          📧 contacto@proscout.cl</p>
          
          <p><strong>Última actualización: Julio 2025</strong></p>
        </div>
      `,
      buttons: ['Cerrar'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async mostrarPoliticaPrivacidad() {
    const alert = await this.alertController.create({
      header: 'Política de Privacidad',
      message: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h3>POLÍTICA DE PRIVACIDAD – PROSCOUT</h3>
          
          <h4>1. INTRODUCCIÓN</h4>
          <p>Esta Política de Privacidad explica cómo ProScout recopila, utiliza, almacena y protege los datos personales de sus usuarios, incluyendo menores de edad con autorización de su tutor legal.</p>
          
          <h4>2. RECOLECCIÓN DE DATOS</h4>
          <p>Recopilamos datos que los usuarios proporcionan al registrarse o al utilizar la app, como:<br>
          - Nombre, RUT, fecha de nacimiento, sexo, nacionalidad<br>
          - Datos físicos y deportivos<br>
          - Información de contacto del tutor legal (si el usuario es menor)<br>
          - Ubicación geográfica (previa autorización)<br>
          - Fotografías, videos y estadísticas deportivas</p>
          
          <h4>3. FINALIDAD DEL USO DE DATOS</h4>
          <p>Usamos los datos personales para:<br>
          - Crear y mostrar perfiles deportivos dentro de la app<br>
          - Mejorar la experiencia del usuario<br>
          - Permitir la interacción entre jugadores y scouters<br>
          - Generar estadísticas internas y reportes de uso</p>
          
          <h4>4. COMPARTICIÓN DE DATOS</h4>
          <p>No compartimos información personal con terceros sin consentimiento previo.<br>
          En casos legales, podríamos estar obligados a entregar información a autoridades competentes.</p>
          
          <h4>5. ALMACENAMIENTO Y SEGURIDAD</h4>
          <p>- Los datos se almacenan en servidores seguros.<br>
          - Aplicamos medidas técnicas y organizativas para evitar accesos no autorizados, pérdidas o manipulaciones.</p>
          
          <h4>6. ACCESO Y ELIMINACIÓN DE DATOS</h4>
          <p>Los usuarios (o sus tutores legales) pueden solicitar:<br>
          - Acceso a sus datos personales<br>
          - Modificación o corrección de datos<br>
          - Eliminación total de su perfil</p>
          
          <h4>7. MENORES DE EDAD</h4>
          <p>Los menores solo pueden usar la app bajo autorización y supervisión de un tutor legal.<br>
          Toda la actividad del menor será visible para el tutor.</p>
          
          <h4>8. ACTUALIZACIONES A ESTA POLÍTICA</h4>
          <p>Esta política puede ser modificada en cualquier momento.<br>
          Cualquier cambio relevante será informado a los usuarios.</p>
          
          <h4>9. CONTACTO</h4>
          <p>Si tienes preguntas o solicitudes sobre privacidad y protección de datos, escríbenos a:<br>
          📧 contacto@proscout.cl</p>
          
          <p><strong>Última actualización: Julio 2025</strong></p>
        </div>
      `,
      buttons: ['Cerrar'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }
}